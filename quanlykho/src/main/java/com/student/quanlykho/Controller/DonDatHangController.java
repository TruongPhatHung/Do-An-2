package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.*;
import com.student.quanlykho.Repository.*;
import com.student.quanlykho.Service.AuditLogService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class DonDatHangController {

    @Autowired private DonDatHangRepository donDatHangRepository;
    @Autowired private NhaCungCapRepository nhaCungCapRepository;
    @Autowired private SanPhamNCCRepository sanPhamNCCRepository;
    @Autowired private HangHoaRepository hangHoaRepository;
    @Autowired private AuditLogService auditLogService;

    @GetMapping
    public List<DonDatHang> getAll() {
        return donDatHangRepository.findAll();
    }

    @GetMapping("/importable")
    public List<DonDatHang> getOrdersToImport() {
        return donDatHangRepository.findByTrangThaiIn(List.of("Mới Tạo", "Giao Thiếu"));
    }

    // 🚀 HÀM TẠO ĐƠN: Đã tích hợp tự động cập nhật giá bán theo hợp đồng
    @PostMapping
    @Transactional
    public DonDatHang create(@RequestBody DonHangRequest request) {
        DonDatHang donDatHang = new DonDatHang();
        donDatHang.setMaDon(request.getMaDon());
        donDatHang.setTrangThai("Mới Tạo");
        donDatHang.setNgayTao(LocalDateTime.now()); // Đảm bảo có ngày tạo

        NhaCungCap nhaCungCap = nhaCungCapRepository.findByMaNCC(request.getNhaCungCap().getMaNCC())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhà cung cấp"));

        donDatHang.setNhaCungCap(nhaCungCap);

        List<ChiTietDonDatHang> chiTietDonDatHangs = request.getChiTiets().stream().map(item -> {
            ChiTietDonDatHang chiTiet = new ChiTietDonDatHang();
            chiTiet.setDonDatHang(donDatHang);

            // 🎯 ĐÂY LÀ BIẾN sanPham MÀ SẾP ĐANG THIẾU
            SanPhamNCC sanPham = sanPhamNCCRepository.findByMaHangAndNhaCungCap_MaNCC(item.getHangHoa().getMaHang(), nhaCungCap.getMaNCC())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hàng hóa: " + item.getHangHoa().getMaHang()));

            HangHoa actualHangHoa;
            if (!hangHoaRepository.existsById(sanPham.getMaHang())) {
                HangHoa newProduct = new HangHoa();
                newProduct.setMaHang(sanPham.getMaHang());
                newProduct.setTenHang(sanPham.getTenHang());
                newProduct.setLoaiHang(sanPham.getLoaiHang());
                newProduct.setSoLuongTon(0);
                newProduct.setSoLuongToiThieu(10);
                actualHangHoa = newProduct;
            } else {
                actualHangHoa = hangHoaRepository.findById(sanPham.getMaHang()).get();
            }

            // 💰 CẬP NHẬT GIÁ: GIÁ NHẬP VÀ GIÁ BÁN CHO ĐẠI LÝ (Markup 20%)
            actualHangHoa.setGiaNhap(item.getDonGia());
            actualHangHoa.setGiaBan(item.getDonGia() * 1.2); // Sếp có thể thay 1.2 bằng tỉ lệ sếp muốn

            hangHoaRepository.save(actualHangHoa);

            chiTiet.setHangHoa(actualHangHoa);
            chiTiet.setSoLuongDat(item.getSoLuongDat());
            chiTiet.setDonGia(item.getDonGia());
            chiTiet.setSoLuongDaNhap(0);

            return chiTiet;
        }).collect(Collectors.toList());

        donDatHang.setChiTiets(chiTietDonDatHangs);
        DonDatHang saved = donDatHangRepository.save(donDatHang);

        auditLogService.ghiLog("THÊM", "ĐƠN ĐẶT HÀNG (PO)", saved.getMaDon(), "Chưa có", "Tạo đơn mua hàng từ NCC");

        return saved;
    }

    // 🚀 TÍNH NĂNG: LẤY DANH SÁCH HÀNG ĐANG CHỜ VỀ (FIX LỖI CHÍNH TẢ & SỐ LƯỢNG)
    @GetMapping("/hang-dang-cho-ve")
    public ResponseEntity<Map<String, Integer>> getHangDangChoVeTuPO() {
        LocalDateTime mocThoiGian = LocalDateTime.now().minusDays(3);

        List<DonDatHang> activePOs = donDatHangRepository.findAll().stream()
                .filter(po -> !po.getTrangThai().equalsIgnoreCase("Hoàn Tất")
                        && !po.getTrangThai().equalsIgnoreCase("Hoàn Thành")
                        && !po.getTrangThai().equalsIgnoreCase("Đã Hủy")
                        && !po.getTrangThai().equalsIgnoreCase("Từ Chối"))
                .filter(po -> po.getNgayTao() != null && po.getNgayTao().isAfter(mocThoiGian))
                .collect(Collectors.toList());

        Map<String, Integer> hangPendingMap = new HashMap<>();
        for (DonDatHang po : activePOs) {
            for (ChiTietDonDatHang ct : po.getChiTiets()) {
                if(ct.getHangHoa() != null) {
                    String maHang = ct.getHangHoa().getMaHang();
                    int daNhap = (ct.getSoLuongDaNhap() != null) ? ct.getSoLuongDaNhap() : 0;
                    int soLuongThucCho = ct.getSoLuongDat() - daNhap;

                    if (soLuongThucCho > 0) {
                        hangPendingMap.put(maHang, hangPendingMap.getOrDefault(maHang, 0) + soLuongThucCho);
                    }
                }
            }
        }
        return ResponseEntity.ok(hangPendingMap);
    }

    // --- DTO CLASSES (GIỮ NGUYÊN) ---
    public static class DonHangRequest {
        private String maDon;
        private NhaCungCapRequest nhaCungCap;
        private List<ChiTietRequest> chiTiets;
        public String getMaDon() { return maDon; }
        public void setMaDon(String maDon) { this.maDon = maDon; }
        public NhaCungCapRequest getNhaCungCap() { return nhaCungCap; }
        public void setNhaCungCap(NhaCungCapRequest nhaCungCap) { this.nhaCungCap = nhaCungCap; }
        public List<ChiTietRequest> getChiTiets() { return chiTiets; }
        public void setChiTiets(List<ChiTietRequest> chiTiets) { this.chiTiets = chiTiets; }
    }

    public static class NhaCungCapRequest {
        private String maNCC;
        public String getMaNCC() { return maNCC; }
        public void setMaNCC(String maNCC) { this.maNCC = maNCC; }
    }

    public static class ChiTietRequest {
        private HangHoaRequest hangHoa;
        private int soLuongDat;
        private Double donGia;
        public HangHoaRequest getHangHoa() { return hangHoa; }
        public void setHangHoa(HangHoaRequest hangHoa) { this.hangHoa = hangHoa; }
        public int getSoLuongDat() { return soLuongDat; }
        public void setSoLuongDat(int soLuongDat) { this.soLuongDat = soLuongDat; }
        public Double getDonGia() { return donGia; }
        public void setDonGia(Double donGia) { this.donGia = donGia; }
    }

    public static class HangHoaRequest {
        private String maHang;
        public String getMaHang() { return maHang; }
        public void setMaHang(String maHang) { this.maHang = maHang; }
    }
}