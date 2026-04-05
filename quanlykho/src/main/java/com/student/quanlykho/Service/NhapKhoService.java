package com.student.quanlykho.Service;

import com.student.quanlykho.Entity.*;
import com.student.quanlykho.Repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class NhapKhoService {

    @Autowired
    private DonDatHangRepository donDatHangRepository;
    @Autowired
    private ChiTietDonDatHangRepository chiTietDonDatHangRepository;
    @Autowired
    private HangHoaRepository hangHoaRepository;
    @Autowired
    private PhieuNhapRepository phieuNhapRepository;
    @Autowired
    private AuditLogService auditLogService;

    @Transactional
    public String taoPhieuNhap(String maDonHang, String nguoiNhap, Map<String, Integer> hangNhap, String ghiChu) {
        // 🎯 Bước 0: Tìm đơn hàng gốc (PO)
        DonDatHang po = donDatHangRepository.findById(maDonHang)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng " + maDonHang));

        // 1. Tạo vỏ Phiếu Nhập
        PhieuNhap phieu = new PhieuNhap();
        phieu.setMaPhieuNhap("PNK-" + System.currentTimeMillis());
        phieu.setNgayNhap(LocalDateTime.now());
        phieu.setNguoiNhap(nguoiNhap);
        phieu.setNhaCungCap(po.getNhaCungCap());
        phieu.setDonDatHang(po);

        // 🎯 XỬ LÝ GHI CHÚ:
        // Ưu tiên lấy ghi chú từ form nhập kho gửi lên, nếu không có thì lấy ghi chú gốc từ Đơn đặt hàng
        String noteToSave = (ghiChu != null && !ghiChu.trim().isEmpty()) ? ghiChu : po.getGhiChu();
        phieu.setGhiChu(noteToSave);

        double tongTienPhieu = 0;
        List<ChiTietPhieuNhap> dsChiTietPhieu = new ArrayList<>();
        boolean isGiaoDuTatCa = true;

        // 2. Duyệt qua danh sách chi tiết của PO để xử lý hàng hóa
        for (ChiTietDonDatHang ctPO : po.getChiTiets()) {
            String maHang = (ctPO.getHangHoa() != null) ? ctPO.getHangHoa().getMaHang() : null;
            if (maHang == null) continue;

            Integer slNhap = hangNhap.get(maHang);

            // Chỉ xử lý những món có nhập số lượng > 0
            if (slNhap != null && slNhap > 0) {
                // 💡 LOGIC KIỂM TRA SỐ LƯỢNG: Tránh nhập quá số lượng còn lại trong đơn
                int conLai = ctPO.getSoLuongDat() - ctPO.getSoLuongDaNhap();
                if (slNhap > conLai) {
                    throw new RuntimeException("Lỗi: Mặt hàng [" + ctPO.getHangHoa().getTenHang() +
                            "] không thể nhập quá số lượng đặt! Còn lại cần nhập: " + conLai + ", Bạn đang nhập: " + slNhap);
                }

                // Cập nhật số lượng đã nhận thực tế vào Đơn Hàng (PO)
                int daNhapCu = ctPO.getSoLuongDaNhap();
                ctPO.setSoLuongDaNhap(daNhapCu + slNhap);

                // Cập nhật Tồn Kho thực tế của Hàng Hóa
                HangHoa hh = hangHoaRepository.findById(maHang)
                        .orElseThrow(() -> new RuntimeException("Lỗi dữ liệu: Không tìm thấy hàng hóa " + maHang));

                int tonKhoCu = (hh.getSoLuongTon() == null) ? 0 : hh.getSoLuongTon();
                hh.setSoLuongTon(tonKhoCu + slNhap);
                hangHoaRepository.save(hh);

                // Ghi Nhật ký (Audit Log)
                auditLogService.ghiLog("NHẬP KHO", "HÀNG HÓA", maHang,
                        "Kho cũ: " + tonKhoCu, "Nhập thêm: " + slNhap + " | Tổng tồn mới: " + hh.getSoLuongTon());

                // Tạo Chi Tiết Phiếu Nhập để lưu vết lịch sử
                ChiTietPhieuNhap ctPN = new ChiTietPhieuNhap();
                ctPN.setPhieuNhap(phieu);
                ctPN.setHangHoa(hh);
                ctPN.setSoLuong(slNhap);
                ctPN.setDonGia(ctPO.getDonGia());
                dsChiTietPhieu.add(ctPN);

                // Cộng dồn tổng tiền phiếu
                tongTienPhieu += (slNhap * ctPO.getDonGia());
            }

            // Sau khi cập nhật, kiểm tra xem món này đã giao đủ chưa
            if (ctPO.getSoLuongDaNhap() < ctPO.getSoLuongDat()) {
                isGiaoDuTatCa = false;
            }
        }

        // 3. Lưu Phiếu Nhập hoàn chỉnh
        phieu.setChiTiets(dsChiTietPhieu);
        phieu.setTongTien(tongTienPhieu);
        phieuNhapRepository.save(phieu);

        // 4. Cập nhật trạng thái cho Đơn đặt hàng gốc (PO)
        // Nếu tất cả các món đều đã giao đủ -> Hoàn Tất. Nếu chưa -> Giao Thiếu
        po.setTrangThai(isGiaoDuTatCa ? "Hoàn Tất" : "Giao Thiếu");
        donDatHangRepository.save(po);

        return "Nhập kho thành công phiếu " + phieu.getMaPhieuNhap();
    }
}