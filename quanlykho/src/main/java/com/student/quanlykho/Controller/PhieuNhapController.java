package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.ChiTietDonDatHang;
import com.student.quanlykho.Entity.DonDatHang;
import com.student.quanlykho.Entity.HangHoa;
import com.student.quanlykho.Repository.ChiTietDonDatHangRepository;
import com.student.quanlykho.Repository.DonDatHangRepository;
import com.student.quanlykho.Repository.HangHoaRepository;
import com.student.quanlykho.Service.AuditLogService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/phieu-nhap")
@CrossOrigin(origins = "*")
public class PhieuNhapController {

    @Autowired
    private DonDatHangRepository donDatHangRepository;

    @Autowired
    private ChiTietDonDatHangRepository chiTietDonDatHangRepository;

    @Autowired
    private HangHoaRepository hangHoaRepository;

    @Autowired
    private AuditLogService auditLogService;

    @PostMapping
    @Transactional
    public String nhapKho(@RequestBody NhapKhoRequest request) {
        // 1. Tìm đơn đặt hàng (PO)
        DonDatHang po = donDatHangRepository.findById(request.getMaDonHang())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy PO: " + request.getMaDonHang()));

        // Lấy tên Nhà cung cấp để ghi log đối soát
        String tenNCC = (po.getNhaCungCap() != null) ? po.getNhaCungCap().getTenNCC() : "N/A";

        boolean isGiaoDuTatCa = true;

        // 2. Duyệt qua từng món hàng trong yêu cầu nhập kho
        for (Map.Entry<String, Integer> entry : request.getChiTietNhap().entrySet()) {
            String maHang = entry.getKey();
            Integer soLuongNhap = entry.getValue();

            if (soLuongNhap == null || soLuongNhap <= 0) continue;

            // --- A. TÌM HÀNG HÓA TRONG KHO TỔNG ---
            HangHoa hangHoa = hangHoaRepository.findById(maHang)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy mặt hàng: " + maHang));

            // --- B. TÌM CHI TIẾT TRONG ĐƠN HÀNG ĐỂ LẤY THÔNG TIN LOẠI ---
            ChiTietDonDatHang chiTietPO = chiTietDonDatHangRepository.findByDonDatHangAndMaHang(po, maHang)
                    .orElseThrow(() -> new RuntimeException("Mặt hàng " + maHang + " không thuộc đơn hàng " + po.getMaDon()));

            // 🎯 TỰ ĐỘNG CẬP NHẬT LOẠI HÀNG (Kế thừa từ danh mục Nhà cung cấp trong PO)
            // Nếu hàng hóa tổng đang "Chưa phân loại", lấy loại từ PO ốp sang
            if (hangHoa.getLoaiHang() == null && chiTietPO.getLoaiHang() != null) {
                hangHoa.setLoaiHang(chiTietPO.getLoaiHang());
            }

            // --- C. CẬP NHẬT TỒN KHO ---
            int tonKhoCu = hangHoa.getSoLuongTon();
            hangHoa.setSoLuongTon(tonKhoCu + soLuongNhap);
            hangHoaRepository.save(hangHoa);

            // --- D. CẬP NHẬT TIẾN ĐỘ GIAO HÀNG TRÊN PO ---
            chiTietPO.setSoLuongDaNhap(chiTietPO.getSoLuongDaNhap() + soLuongNhap);
            chiTietDonDatHangRepository.save(chiTietPO);

            if (chiTietPO.getSoLuongDaNhap() < chiTietPO.getSoLuongDat()) {
                isGiaoDuTatCa = false; // Vẫn còn nợ hàng
            }

            // 🎯 GHI LOG CHI TIẾT (Bổ sung tên NCC và Loại hàng để Admin dễ kiểm soát)
            String tenLoai = (hangHoa.getLoaiHang() != null) ? hangHoa.getLoaiHang().getTenLoai() : "Chưa phân loại";
            String logMoi = String.format("Nhập: +%d | Loại: %s | NCC: %s | Tồn mới: %d",
                    soLuongNhap, tenLoai, tenNCC, hangHoa.getSoLuongTon());

            auditLogService.ghiLog("NHẬP KHO", "HÀNG HÓA", maHang, "Tồn kho cũ: " + tonKhoCu, logMoi);
        }

        // 3. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
        if (isGiaoDuTatCa) {
            po.setTrangThai("Hoàn Tất");
        } else {
            po.setTrangThai("Giao Thiếu");
        }
        donDatHangRepository.save(po);

        return "Đã xác nhận nhập kho đơn " + po.getMaDon() + " từ Nhà cung cấp: " + tenNCC;
    }

    public static class NhapKhoRequest {
        private String maDonHang;
        private Map<String, Integer> chiTietNhap;

        public String getMaDonHang() { return maDonHang; }
        public void setMaDonHang(String maDonHang) { this.maDonHang = maDonHang; }
        public Map<String, Integer> getChiTietNhap() { return chiTietNhap; }
        public void setChiTietNhap(Map<String, Integer> chiTietNhap) { this.chiTietNhap = chiTietNhap; }
    }
}