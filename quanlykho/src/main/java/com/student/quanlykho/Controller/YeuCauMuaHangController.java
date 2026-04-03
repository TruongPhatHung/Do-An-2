package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.*;
import com.student.quanlykho.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/yeu-cau-mua")
@CrossOrigin(origins = "*")
public class YeuCauMuaHangController {

    @Autowired
    private ThongBaoRepository thongBaoRepository;

    @Autowired
    private YeuCauMuaHangRepository yeuCauMuaHangRepository;

    @Autowired
    private NhaCungCapRepository nhaCungCapRepository;

    @Autowired
    private HangHoaRepository hangHoaRepository;

    // 🎯 THÊM CÁI NÀY ĐỂ TÌM SP CỦA NCC
    @Autowired
    private SanPhamNCCRepository sanPhamNCCRepository;

    // ========================================================
    // 📦 1. QUẢN LÝ KHO: TẠO PHIẾU YÊU CẦU MUA HÀNG (PR)
    // ========================================================
    @PostMapping
    @Transactional
    public YeuCauMuaHang taoYeuCau(@RequestBody YeuCauMuaRequest request) {
        YeuCauMuaHang ycm = new YeuCauMuaHang();
        ycm.setMaYeuCau(request.getMaYeuCau());
        ycm.setNguoiYeuCau(request.getNguoiYeuCau());
        ycm.setGhiChu(request.getGhiChu());
        ycm.setTrangThai("Chờ Duyệt"); // Luôn luôn bắt đầu bằng Chờ Duyệt
        ycm.setNgayYeuCau(LocalDateTime.now());

        // Lấy thông tin Nhà Cung Cấp
        NhaCungCap ncc = nhaCungCapRepository.findByMaNCC(request.getMaNhaCungCap())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhà cung cấp!"));
        ycm.setNhaCungCap(ncc);

        // Xử lý danh sách mặt hàng cần mua
        List<ChiTietYeuCauMua> dsChiTiet = new ArrayList<>();
        for (ChiTietYeuCauMuaRequest item : request.getChiTiets()) {

            // 🎯 THUẬT TOÁN MỚI: TÌM TRONG KHO, KHÔNG CÓ THÌ TẠO MỚI TỪ BẢNG NHÀ CUNG CẤP
            HangHoa hangHoa = hangHoaRepository.findById(item.getMaHang())
                    .orElseGet(() -> {
                        // Khúc này là khi kho CHƯA CÓ mặt hàng này
                        // 1. Chạy sang hỏi bảng SanPhamNCC xem nó là cái gì
                        SanPhamNCC spNcc = sanPhamNCCRepository.findByMaHangAndNhaCungCap_MaNCC(item.getMaHang(), ncc.getMaNCC())
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã hàng " + item.getMaHang() + " trong báo giá của Nhà Cung Cấp!"));

                        // 2. Tự động "Khai sinh" mặt hàng mới vào trong Kho (Tồn = 0)
                        HangHoa hhMoi = new HangHoa();
                        hhMoi.setMaHang(spNcc.getMaHang()); // Lấy mã của NCC
                        hhMoi.setTenHang(spNcc.getTenHang()); // Lấy tên của NCC

// 🎯 BỔ SUNG CHỖ NÀY: Giá bán của NCC chính là Giá nhập của mình!
                        hhMoi.setGiaNhap(spNcc.getGiaBan());

// (Tùy chọn) Sếp có thể cho nó tự tính luôn giá bán ra thị trường (VD: Lời 20%)
                        hhMoi.setGiaBan(spNcc.getGiaBan() != null ? spNcc.getGiaBan() * 1.2 : 0);

                        hhMoi.setSoLuongTon(0); // Kho đang trống nên tồn = 0  // Gắn tạm loại hàng của NCC

                        // Lưu vào kho
                        return hangHoaRepository.save(hhMoi);
                    });

            ChiTietYeuCauMua chiTiet = new ChiTietYeuCauMua();
            chiTiet.setYeuCauMuaHang(ycm);
            chiTiet.setHangHoa(hangHoa);
            chiTiet.setSoLuongCanMua(item.getSoLuongCanMua());

            dsChiTiet.add(chiTiet);
        }

        ycm.setChiTiets(dsChiTiet);
        YeuCauMuaHang saved = yeuCauMuaHangRepository.save(ycm);

        // ============================================
        // 🔔 TẠO VÀ LƯU THÔNG BÁO CHO SẾP (RUNG CHUÔNG)
        // ============================================
        ThongBao tb = new ThongBao();
        tb.setTieuDe("💰 Đề xuất mua hàng mới!");
        tb.setNoiDung("Nhân viên " + saved.getNguoiYeuCau() + " vừa lập đề xuất mua (" + saved.getMaYeuCau() + "). Vui lòng kiểm tra và phê duyệt.");
        tb.setNguoiNhan("ADMIN"); // Sếp đăng nhập bằng role ADMIN sẽ nhận được
        tb.setDuongDan("/duyet-yeu-cau-mua"); // Click vào chuông bay thẳng tới trang duyệt
        thongBaoRepository.save(tb);
        return saved;

    }

    // ========================================================
    // 📋 2. LẤY DANH SÁCH YÊU CẦU (Cho Kho xem lịch sử / Mua hàng xem đơn đã duyệt)
    // ========================================================
    @GetMapping
    public List<YeuCauMuaHang> layTatCaYeuCau(@RequestParam(required = false) String trangThai) {
        if (trangThai != null && !trangThai.isEmpty()) {
            // Nếu truyền trạng thái vào (VD: ?trangThai=Đã Duyệt) -> Lọc theo trạng thái
            return yeuCauMuaHangRepository.findByTrangThaiOrderByNgayYeuCauDesc(trangThai);
        }
        // Nếu không truyền -> Lấy hết
        return yeuCauMuaHangRepository.findAllByOrderByNgayYeuCauDesc();
    }

    // ========================================================
    // 👑 3. SẾP (ADMIN): DUYỆT HOẶC TỪ CHỐI YÊU CẦU
    // ========================================================
    @PutMapping("/{maYeuCau}/duyet")
    @Transactional
    public YeuCauMuaHang xetDuyetYeuCau(@PathVariable String maYeuCau, @RequestBody DuyetYeuCauRequest request) {
        YeuCauMuaHang ycm = yeuCauMuaHangRepository.findById(maYeuCau)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu yêu cầu mua hàng!"));

        // Chỉ cho phép duyệt các đơn đang "Chờ Duyệt"
        if (!"Chờ Duyệt".equals(ycm.getTrangThai())) {
            throw new RuntimeException("Phiếu này đã được xử lý trước đó, không thể thay đổi!");
        }

        ycm.setTrangThai(request.getTrangThai()); // "Đã Duyệt" hoặc "Từ Chối"

        // Nếu từ chối thì lưu lại lý do Sếp chửi (à nhầm, Sếp góp ý) 😅
        if ("Từ Chối".equals(request.getTrangThai())) {
            ycm.setLyDoTuChoi(request.getLyDoTuChoi());
        }

        YeuCauMuaHang saved = yeuCauMuaHangRepository.save(ycm);

        // ============================================
        // 🔔 2. GỬI THÔNG BÁO CHO KHO KHI SẾP DUYỆT / TỪ CHỐI
        // ============================================
        ThongBao tb = new ThongBao();
        if ("Đã Duyệt".equals(saved.getTrangThai())) {
            tb.setTieuDe("✅ Yêu cầu mua hàng đã được duyệt!");
            tb.setNoiDung("Sếp đã phê duyệt phiếu " + saved.getMaYeuCau() + " của bạn. Phòng Mua hàng sẽ sớm xử lý.");
        } else {
            tb.setTieuDe("❌ Yêu cầu mua hàng bị từ chối!");
            tb.setNoiDung("Sếp đã từ chối phiếu " + saved.getMaYeuCau() + " với lý do: " + saved.getLyDoTuChoi());
        }

        // Gửi trả lại đúng người đã tạo phiếu
        tb.setNguoiNhan(saved.getNguoiYeuCau());
        tb.setDuongDan("/lich-su-yeu-cau-mua"); // Kho click vào sẽ bay tới trang Lịch sử
        thongBaoRepository.save(tb);

        return saved;
    }

    @PutMapping("/{maYeuCau}/hoan-thanh")
    @Transactional
    public void hoanThanhYeuCau(@PathVariable String maYeuCau) {
        YeuCauMuaHang ycm = yeuCauMuaHangRepository.findById(maYeuCau)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu yêu cầu!"));

        // Đổi trạng thái để nó biến mất khỏi danh sách chờ lên đơn
        ycm.setTrangThai("Đã Lên PO");
        yeuCauMuaHangRepository.save(ycm);
    }


    // ========================================================
    // 🏗️ CÁC LỚP DTO ĐỂ HỨNG DỮ LIỆU TỪ REACT GỬI LÊN
    // ========================================================
    public static class YeuCauMuaRequest {
        private String maYeuCau;
        private String maNhaCungCap;
        private String nguoiYeuCau;
        private String ghiChu;
        private List<ChiTietYeuCauMuaRequest> chiTiets;

        // Getters & Setters
        public String getMaYeuCau() { return maYeuCau; }
        public void setMaYeuCau(String maYeuCau) { this.maYeuCau = maYeuCau; }
        public String getMaNhaCungCap() { return maNhaCungCap; }
        public void setMaNhaCungCap(String maNhaCungCap) { this.maNhaCungCap = maNhaCungCap; }
        public String getNguoiYeuCau() { return nguoiYeuCau; }
        public void setNguoiYeuCau(String nguoiYeuCau) { this.nguoiYeuCau = nguoiYeuCau; }
        public String getGhiChu() { return ghiChu; }
        public void setGhiChu(String ghiChu) { this.ghiChu = ghiChu; }
        public List<ChiTietYeuCauMuaRequest> getChiTiets() { return chiTiets; }
        public void setChiTiets(List<ChiTietYeuCauMuaRequest> chiTiets) { this.chiTiets = chiTiets; }
    }

    public static class ChiTietYeuCauMuaRequest {
        private String maHang;
        private Integer soLuongCanMua;

        // Getters & Setters
        public String getMaHang() { return maHang; }
        public void setMaHang(String maHang) { this.maHang = maHang; }
        public Integer getSoLuongCanMua() { return soLuongCanMua; }
        public void setSoLuongCanMua(Integer soLuongCanMua) { this.soLuongCanMua = soLuongCanMua; }
    }

    public static class DuyetYeuCauRequest {
        private String trangThai;
        private String lyDoTuChoi;

        // Getters & Setters
        public String getTrangThai() { return trangThai; }
        public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
        public String getLyDoTuChoi() { return lyDoTuChoi; }
        public void setLyDoTuChoi(String lyDoTuChoi) { this.lyDoTuChoi = lyDoTuChoi; }
    }
}