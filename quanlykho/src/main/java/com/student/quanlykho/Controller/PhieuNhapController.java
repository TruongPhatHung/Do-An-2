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
    private AuditLogService auditLogService; // GỌI CAMERA GIÁM SÁT VÀO ĐÂY

    @PostMapping
    @Transactional
    public String nhapKho(@RequestBody NhapKhoRequest request) {
        // 1. Tìm đơn đặt hàng
        DonDatHang po = donDatHangRepository.findById(request.getMaDonHang())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy PO: " + request.getMaDonHang()));

        boolean isGiaoDuTatCa = true;

        // 2. Duyệt qua từng món hàng mà React gửi xuống để nhập kho
        for (Map.Entry<String, Integer> entry : request.getChiTietNhap().entrySet()) {
            String maHang = entry.getKey();
            Integer soLuongThucNhapLầnNày = entry.getValue();

            // Bỏ qua nếu người dùng không nhập số lượng cho món này (số lượng = 0)
            if (soLuongThucNhapLầnNày == null || soLuongThucNhapLầnNày <= 0) continue;

            // --- A. CẬP NHẬT TỒN KHO TRONG BẢNG HÀNG HÓA ---
            HangHoa hangHoa = hangHoaRepository.findById(maHang)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy mặt hàng: " + maHang));

            int tonKhoCu = hangHoa.getSoLuongTon();
            hangHoa.setSoLuongTon(tonKhoCu + soLuongThucNhapLầnNày);
            hangHoaRepository.save(hangHoa);

            // 🎯 GHI LOG CHI TIẾT TỪNG MẶT HÀNG BỊ THAY ĐỔI TỒN KHO
            String logCu = String.format("Tồn kho hiện tại: %d", tonKhoCu);
            String logMoi = String.format("Nhập thêm: +%d ➔ Tồn mới: %d (Từ phiếu: %s)",
                    soLuongThucNhapLầnNày, hangHoa.getSoLuongTon(), po.getMaDon());
            auditLogService.ghiLog("NHẬP KHO", "HÀNG HÓA", maHang, logCu, logMoi);

            // --- B. CẬP NHẬT SỐ LƯỢNG ĐÃ NHẬP VÀO CHI TIẾT ĐƠN HÀNG (PO) ---
            ChiTietDonDatHang chiTietPO = chiTietDonDatHangRepository.findByDonDatHangAndMaHang(po, maHang)
                    .orElseThrow(() -> new RuntimeException("Mặt hàng không có trong đơn này"));

            // Lấy thẳng giá trị vì nó là kiểu int nguyên thủy (mặc định là 0 nếu chưa nhập)
            int daNhapCu = chiTietPO.getSoLuongDaNhap();

            chiTietPO.setSoLuongDaNhap(daNhapCu + soLuongThucNhapLầnNày);
            chiTietDonDatHangRepository.save(chiTietPO);

            // Kiểm tra xem món này đã giao đủ chưa
            if (chiTietPO.getSoLuongDaNhap() < chiTietPO.getSoLuongDat()) {
                isGiaoDuTatCa = false; // Còn nợ hàng
            }
        }

        // 3. Cập nhật trạng thái của Đơn đặt hàng (PO)
        String trangThaiCu = po.getTrangThai();
        if (isGiaoDuTatCa) {
            po.setTrangThai("Hoàn Tất");
        } else {
            po.setTrangThai("Giao Thiếu");
        }
        donDatHangRepository.save(po);

        // 🎯 GHI LOG THAY ĐỔI TRẠNG THÁI PO
        if (!trangThaiCu.equals(po.getTrangThai())) {
            auditLogService.ghiLog("SỬA", "ĐƠN ĐẶT HÀNG", po.getMaDon(),
                    "Trạng thái: " + trangThaiCu, "Trạng thái mới: " + po.getTrangThai());
        }

        return "Nhập kho thành công cho đơn: " + po.getMaDon();
    }

    // Class nhận dữ liệu từ React (Khớp với file NhapKho.jsx của bạn)
    public static class NhapKhoRequest {
        private String maDonHang;
        private Map<String, Integer> chiTietNhap;

        public String getMaDonHang() { return maDonHang; }
        public void setMaDonHang(String maDonHang) { this.maDonHang = maDonHang; }
        public Map<String, Integer> getChiTietNhap() { return chiTietNhap; }
        public void setChiTietNhap(Map<String, Integer> chiTietNhap) { this.chiTietNhap = chiTietNhap; }
    }
}