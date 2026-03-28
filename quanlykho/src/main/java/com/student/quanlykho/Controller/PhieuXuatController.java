package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.*;
import com.student.quanlykho.Repository.*;
import com.student.quanlykho.Service.AuditLogService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/phieu-xuat")
@CrossOrigin(origins = "*")
public class PhieuXuatController {

    @Autowired
    private HangHoaRepository hangHoaRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private PhieuXuatRepository phieuXuatRepository;

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Autowired
    private YeuCauXuatKhoRepository yeuCauXuatKhoRepository;

    @PostMapping
    @Transactional
    public PhieuXuat xuatKho(@RequestBody XuatKhoRequest request) {

        // ==========================================
        // 🎯 BƯỚC 1: KHỞI TẠO PHIẾU XUẤT
        // ==========================================
        PhieuXuat phieuXuat = new PhieuXuat();
        phieuXuat.setMaPhieuXuat(request.getMaPhieuXuat());
        phieuXuat.setLyDoXuat(request.getLyDo());
        phieuXuat.setTenNguoiNhan(request.getTenNguoiNhan());

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        NguoiDung user = nguoiDungRepository.findByTenDangNhap(username).orElse(null);
        phieuXuat.setNguoiDung(user);

        List<ChiTietPhieuXuat> dsChiTiet = new ArrayList<>();
        double tongTienPhieu = 0.0;

        // ==========================================
        // 🎯 BƯỚC 2: XỬ LÝ TRỪ KHO VÀ TÍNH TIỀN
        // ==========================================
        for (Map.Entry<String, Integer> entry : request.getChiTietXuat().entrySet()) {
            String maHang = entry.getKey();
            Integer soLuongXuat = entry.getValue();

            if (soLuongXuat == null || soLuongXuat <= 0) continue;

            HangHoa hangHoa = hangHoaRepository.findById(maHang)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy mã hàng: " + maHang));

            // Kiểm tra tồn kho
            if (hangHoa.getSoLuongTon() < soLuongXuat) {
                throw new RuntimeException("Lỗi: Hàng [" + hangHoa.getTenHang() + "] không đủ để xuất!");
            }

            // Trừ kho
            hangHoa.setSoLuongTon(hangHoa.getSoLuongTon() - soLuongXuat);
            hangHoaRepository.save(hangHoa);

            // Chốt đơn giá tại thời điểm xuất
            Double donGiaXuat = 0.0;
            String lyDoLower = (request.getLyDo() != null) ? request.getLyDo().toLowerCase() : "";

            if (lyDoLower.contains("bán") || lyDoLower.contains("khách")) {
                donGiaXuat = (hangHoa.getGiaBan() != null) ? hangHoa.getGiaBan() : 0.0;
            } else {
                donGiaXuat = (hangHoa.getGiaNhap() != null) ? hangHoa.getGiaNhap() : 0.0;
            }

            tongTienPhieu += (donGiaXuat * soLuongXuat);

            ChiTietPhieuXuat chiTiet = new ChiTietPhieuXuat();
            chiTiet.setPhieuXuat(phieuXuat);
            chiTiet.setHangHoa(hangHoa);
            chiTiet.setSoLuongXuat(soLuongXuat);
            chiTiet.setDonGia(donGiaXuat);
            dsChiTiet.add(chiTiet);

            // Ghi Log
            auditLogService.ghiLog("XUẤT KHO", "HÀNG HÓA", maHang, "Tồn cũ: " + (hangHoa.getSoLuongTon() + soLuongXuat), "Xuất: " + soLuongXuat);
        }

        // ==========================================
        // 🎯 BƯỚC 3: LƯU PHIẾU XUẤT
        // ==========================================
        phieuXuat.setChiTiets(dsChiTiet);
        phieuXuat.setTongTien(tongTienPhieu);
        PhieuXuat savedPhieu = phieuXuatRepository.save(phieuXuat);

        // ==========================================
        // 🎯 BƯỚC 4: CẬP NHẬT LẠI LỆNH YÊU CẦU (YCX)
        // ==========================================
        String lyDoXuat = request.getLyDo();
        if (lyDoXuat != null && lyDoXuat.contains("YCX-")) {
            try {
                // Trích xuất mã YCX từ lý do (Ví dụ: "Xuất bán (Lệnh: YCX-123456)")
                int start = lyDoXuat.indexOf("YCX-");
                int end = lyDoXuat.indexOf(")", start);
                String maYeuCau = (end != -1) ? lyDoXuat.substring(start, end) : lyDoXuat.substring(start);

                yeuCauXuatKhoRepository.findById(maYeuCau).ifPresent(ycx -> {
                    // 1. Cập nhật số lượng đã nhặt cho từng món
                    for (Map.Entry<String, Integer> entry : request.getChiTietXuat().entrySet()) {
                        String maHangXuat = entry.getKey();
                        int qtyVuaNhat = entry.getValue();

                        for (ChiTietYeuCauXuat ctYcx : ycx.getChiTiets()) {
                            if (ctYcx.getHangHoa().getMaHang().equals(maHangXuat)) {
                                int hienTai = (ctYcx.getSoLuongDaXuat() != null) ? ctYcx.getSoLuongDaXuat() : 0;
                                ctYcx.setSoLuongDaXuat(hienTai + qtyVuaNhat);
                                break;
                            }
                        }
                    }

                    // 2. 🎯 LOGIC QUYẾT ĐỊNH: Xóa hay Giữ?
                    boolean vanConNoHang = false;
                    for (ChiTietYeuCauXuat ct : ycx.getChiTiets()) {
                        int yeuCau = (ct.getSoLuongYeuCau() != null) ? ct.getSoLuongYeuCau() : 0;
                        int daXuat = (ct.getSoLuongDaXuat() != null) ? ct.getSoLuongDaXuat() : 0;

                        // Nếu có bất kỳ món nào mà số đã giao < số sếp yêu cầu -> Vẫn tính là nợ
                        if (daXuat < yeuCau) {
                            vanConNoHang = true;
                            break;
                        }
                    }

                    if (vanConNoHang) {
                        ycx.setTrangThai("Giao Thiếu"); // Sẽ tiếp tục hiện ở trang Xuất Kho để "Giao Bù"
                        if (ycx.getNgayHenGiaoBu() == null) {
                            ycx.setNgayHenGiaoBu(java.time.LocalDate.now().plusDays(3));
                        }
                    } else {
                        ycx.setTrangThai("Hoàn Thành"); // 🎯 Sẽ bị API /pending loại bỏ (Xóa khỏi danh sách chờ)
                        ycx.setNgayHenGiaoBu(null);
                    }

                    yeuCauXuatKhoRepository.save(ycx);
                });
            } catch (Exception e) {
                System.out.println("Lỗi đồng bộ trạng thái đơn nợ: " + e.getMessage());
            }
        }

        return savedPhieu;
    }

    @GetMapping
    public List<PhieuXuat> getAllPhieuXuat() {
        return phieuXuatRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "ngayXuat"));
    }

    public static class XuatKhoRequest {
        private String maPhieuXuat;
        private String lyDo;
        private String tenNguoiNhan;
        private Map<String, Integer> chiTietXuat;

        // Getters and Setters...
        public String getMaPhieuXuat() { return maPhieuXuat; }
        public void setMaPhieuXuat(String maPhieuXuat) { this.maPhieuXuat = maPhieuXuat; }
        public String getLyDo() { return lyDo; }
        public void setLyDo(String lyDo) { this.lyDo = lyDo; }
        public String getTenNguoiNhan() { return tenNguoiNhan; }
        public void setTenNguoiNhan(String tenNguoiNhan) { this.tenNguoiNhan = tenNguoiNhan; }
        public Map<String, Integer> getChiTietXuat() { return chiTietXuat; }
        public void setChiTietXuat(Map<String, Integer> chiTietXuat) { this.chiTietXuat = chiTietXuat; }
    }
}