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
    public String taoPhieuNhap(String maDonHang, String nguoiNhap, Map<String, Integer> hangNhap) {
        DonDatHang po = donDatHangRepository.findById(maDonHang)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng " + maDonHang));

        // 1. Tạo vỏ Phiếu Nhập
        PhieuNhap phieu = new PhieuNhap();
        phieu.setMaPhieuNhap("PNK-" + System.currentTimeMillis());
        phieu.setNgayNhap(LocalDateTime.now());
        phieu.setNguoiNhap(nguoiNhap);
        phieu.setNhaCungCap(po.getNhaCungCap());
        phieu.setDonDatHang(po);

        double tongTienPhieu = 0;
        List<ChiTietPhieuNhap> dsChiTietPhieu = new ArrayList<>();
        boolean isGiaoDuTatCa = true;

        // 2. Duyệt qua danh sách chi tiết của PO để lấy dữ liệu chuẩn
        for (ChiTietDonDatHang ctPO : po.getChiTiets()) {
            String maHang = (ctPO.getHangHoa() != null) ? ctPO.getHangHoa().getMaHang() : null;
            if (maHang == null) continue;

            Integer slNhap = hangNhap.get(maHang);

            if (slNhap != null && slNhap > 0) {
                // 💡 LOGIC CỦA SẾP: Bắt lỗi nếu nhân viên kho gõ nhầm số quá tay
                int conLai = ctPO.getSoLuongDat() - ctPO.getSoLuongDaNhap();
                if (slNhap > conLai) {
                    throw new RuntimeException("Lỗi: Mặt hàng " + maHang + " không thể nhập quá số lượng đặt! Cần: " + conLai + ", Đang nhập: " + slNhap);
                }

                // Cập nhật số lượng đã nhận vào Đơn Hàng
                int daNhapCu = ctPO.getSoLuongDaNhap();
                ctPO.setSoLuongDaNhap(daNhapCu + slNhap);

                // Cập nhật Tồn Kho
                HangHoa hh = hangHoaRepository.findById(maHang).orElseThrow(() -> new RuntimeException("Lỗi dữ liệu kho!"));
                int tonKhoCu = (hh.getSoLuongTon() == null) ? 0 : hh.getSoLuongTon();
                hh.setSoLuongTon(tonKhoCu + slNhap);
                hangHoaRepository.save(hh);

                // Ghi Log
                auditLogService.ghiLog("NHẬP KHO", "HÀNG HÓA", maHang, "Cũ: " + tonKhoCu, "Mới: " + hh.getSoLuongTon());

                // Tạo Chi Tiết Phiếu Nhập để lưu Lịch Sử
                ChiTietPhieuNhap ctPN = new ChiTietPhieuNhap();
                ctPN.setPhieuNhap(phieu);
                ctPN.setHangHoa(hh);
                ctPN.setSoLuong(slNhap);
                ctPN.setDonGia(ctPO.getDonGia());
                dsChiTietPhieu.add(ctPN);

                tongTienPhieu += (slNhap * ctPO.getDonGia());
            }

            // Kiểm tra trạng thái giao hàng
            int daNhapHienTai = ctPO.getSoLuongDaNhap();
            int canGiao = ctPO.getSoLuongDat();
            if (daNhapHienTai < canGiao) {
                isGiaoDuTatCa = false;
            }
        }

        // 3. Lưu Phiếu Nhập
        phieu.setChiTiets(dsChiTietPhieu);
        phieu.setTongTien(tongTienPhieu);
        phieuNhapRepository.save(phieu);

        // 4. Cập nhật trạng thái PO
        po.setTrangThai(isGiaoDuTatCa ? "Hoàn Tất" : "Giao Thiếu");
        donDatHangRepository.save(po);

        return "Nhập kho thành công phiếu " + phieu.getMaPhieuNhap();
    }
}