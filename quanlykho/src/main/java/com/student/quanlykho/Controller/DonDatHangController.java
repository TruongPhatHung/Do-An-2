package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.ChiTietDonDatHang;
import com.student.quanlykho.Entity.DonDatHang;
import com.student.quanlykho.Entity.HangHoa; // 🎯 Thêm import này
import com.student.quanlykho.Entity.NhaCungCap;
import com.student.quanlykho.Entity.SanPhamNCC;
import com.student.quanlykho.Repository.DonDatHangRepository;
import com.student.quanlykho.Repository.HangHoaRepository; // 🎯 Thêm import này
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

    // 🎯 1. Bổ sung HangHoaRepository để kiểm tra kho tổng
    @Autowired
    private HangHoaRepository hangHoaRepository;

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public List<DonDatHang> getAll() {
        return donDatHangRepository.findAll();
    }

    @GetMapping("/importable")
    public List<DonDatHang> getOrdersToImport() {
        return donDatHangRepository.findByTrangThaiIn(List.of("Mới Tạo", "Giao Thiếu"));
    }

    @PostMapping
    @Transactional
    public DonDatHang create(@RequestBody DonHangRequest request) {
        DonDatHang donDatHang = new DonDatHang();
        donDatHang.setMaDon(request.getMaDon());
        donDatHang.setTrangThai("Mới Tạo");

        NhaCungCap nhaCungCap = nhaCungCapRepository.findByMaNCC(request.getNhaCungCap().getMaNCC())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhà cung cấp"));

        donDatHang.setNhaCungCap(nhaCungCap);

        List<ChiTietDonDatHang> chiTietDonDatHangs = request.getChiTiets().stream().map(item -> {
            ChiTietDonDatHang chiTiet = new ChiTietDonDatHang();
            chiTiet.setDonDatHang(donDatHang);

            // Tìm sản phẩm trong danh mục của Nhà cung cấp này
            SanPhamNCC sanPham = sanPhamNCCRepository.findByMaHangAndNhaCungCap_MaNCC(item.getHangHoa().getMaHang(), nhaCungCap.getMaNCC())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hàng hóa: " + item.getHangHoa().getMaHang()));

            // ====================================================================
            // 🎯 2. ĐOẠN CODE "THẦN THÁNH" XỬ LÝ LỖI KHÓA NGOẠI:
            // Nếu mã hàng này chưa từng tồn tại trong kho tổng -> Tự động thêm vào
            // ====================================================================
            if (!hangHoaRepository.existsById(sanPham.getMaHang())) {
                HangHoa newProduct = new HangHoa();
                newProduct.setMaHang(sanPham.getMaHang());
                newProduct.setTenHang(sanPham.getTenHang());
                newProduct.setLoaiHang(sanPham.getLoaiHang()); // Lấy loại từ bên NCC sang
                newProduct.setSoLuongTon(0); // Tồn kho ban đầu là 0
                newProduct.setSoLuongToiThieu(10); // Mức cảnh báo tối thiểu (Mặc định)
                newProduct.setGiaNhap(item.getDonGia()); // Lấy giá từ đơn đặt
                newProduct.setDonViTinh("Cái"); // Mặc định đơn vị tính

                hangHoaRepository.save(newProduct); // Lưu vào bảng hang_hoa trước để không bị lỗi Foreign Key!
            }
            // ====================================================================

            chiTiet.setMaHang(sanPham.getMaHang());
            chiTiet.setTenHang(sanPham.getTenHang());
            chiTiet.setSoLuongDat(item.getSoLuongDat());
            chiTiet.setDonGia(item.getDonGia());
            chiTiet.setSoLuongDaNhap(0);

            // Việc này giúp thằng Nhập kho sau này "nhìn" thấy loại để tự động cập nhật
            chiTiet.setLoaiHang(sanPham.getLoaiHang());

            return chiTiet;
        }).collect(Collectors.toList());

        donDatHang.setChiTiets(chiTietDonDatHangs);
        DonDatHang saved = donDatHangRepository.save(donDatHang);

        // Tính tổng số lượng để ghi log
        int tongSoLuong = saved.getChiTiets().stream().mapToInt(ChiTietDonDatHang::getSoLuongDat).sum();

        // GHI LOG
        String moi = String.format("Gửi đến: %s | Gồm %d mặt hàng | Tổng SL đặt: %d",
                nhaCungCap.getTenNCC(), saved.getChiTiets().size(), tongSoLuong);
        auditLogService.ghiLog("THÊM", "ĐƠN ĐẶT HÀNG (PO)", saved.getMaDon(), "Chưa có", moi);

        return saved;
    }

    // --- DTO CLASSES ---
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