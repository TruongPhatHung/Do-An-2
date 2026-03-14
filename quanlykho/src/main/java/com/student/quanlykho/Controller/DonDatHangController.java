package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.ChiTietDonDatHang;
import com.student.quanlykho.Entity.DonDatHang;
import com.student.quanlykho.Entity.NhaCungCap;
import com.student.quanlykho.Entity.SanPhamNCC;
import com.student.quanlykho.Repository.DonDatHangRepository;
import com.student.quanlykho.Repository.NhaCungCapRepository;
import com.student.quanlykho.Repository.SanPhamNCCRepository;
import com.student.quanlykho.Service.AuditLogService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class DonDatHangController {

    @Autowired
    private DonDatHangRepository donDatHangRepository;

    @Autowired
    private NhaCungCapRepository nhaCungCapRepository;

    @Autowired
    private SanPhamNCCRepository sanPhamNCCRepository;

    @Autowired
    private AuditLogService auditLogService;

    // --- CÁC HÀM GET DỮ LIỆU ---
    @GetMapping
    public List<DonDatHang> getAll() {
        return donDatHangRepository.findAll();
    }

    @GetMapping("/importable")
    public List<DonDatHang> getOrdersToImport() {
        return donDatHangRepository.findByTrangThaiIn(List.of("Mới Tạo", "Giao Thiếu"));
    }

    // --- HÀM TẠO ĐƠN HÀNG MỚI CÓ GHI LOG ---
    @PostMapping
    @Transactional
    public DonDatHang create(@RequestBody DonHangRequest request) {
        DonDatHang donDatHang = new DonDatHang();
        donDatHang.setMaDon(request.getMaDon());
        donDatHang.setTrangThai("Mới Tạo");

        NhaCungCap nhaCungCap = nhaCungCapRepository.findByMaNCC(request.getNhaCungCap().getMaNCC())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhà cung cấp"));

        donDatHang.setNhaCungCap(nhaCungCap);

        // Biến để tính tổng số lượng đặt cho việc ghi log
        int tongSoLuong = 0;

        List<ChiTietDonDatHang> chiTietDonDatHangs = request.getChiTiets().stream().map(item -> {
            ChiTietDonDatHang chiTietDonDatHang = new ChiTietDonDatHang();
            chiTietDonDatHang.setDonDatHang(donDatHang);

            SanPhamNCC sanPham = sanPhamNCCRepository.findByMaHangAndNhaCungCap_MaNCC(item.getHangHoa().getMaHang(), nhaCungCap.getMaNCC())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hàng hóa"));

            chiTietDonDatHang.setMaHang(sanPham.getMaHang());
            chiTietDonDatHang.setTenHang(sanPham.getTenHang());
            chiTietDonDatHang.setSoLuongDat(item.getSoLuongDat());
            chiTietDonDatHang.setDonGia(item.getDonGia());
            chiTietDonDatHang.setSoLuongDaNhap(0);

            return chiTietDonDatHang;
        }).collect(Collectors.toList());

        for (ChiTietDonDatHang ct : chiTietDonDatHangs) {
            tongSoLuong += ct.getSoLuongDat();
        }

        donDatHang.setChiTiets(chiTietDonDatHangs);
        DonDatHang saved = donDatHangRepository.save(donDatHang);

        // 🎯 GHI LOG: TẠO ĐƠN ĐẶT HÀNG MỚI (PO)
        String moi = String.format("Gửi đến: %s | Gồm %d mặt hàng | Tổng SL đặt: %d",
                nhaCungCap.getTenNCC(), chiTietDonDatHangs.size(), tongSoLuong);
        auditLogService.ghiLog("THÊM", "ĐƠN ĐẶT HÀNG (PO)", saved.getMaDon(), "Chưa có", moi);

        return saved;
    }

    // =========================================================
    // --- CÁC CLASS DTO NẰM BÊN TRONG CLASS CONTROLLER ---
    // =========================================================
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