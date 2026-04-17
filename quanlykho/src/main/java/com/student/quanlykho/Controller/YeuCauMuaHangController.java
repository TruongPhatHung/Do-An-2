package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.*;
import com.student.quanlykho.Repository.*;
import com.student.quanlykho.Service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/yeu-cau-mua")
@CrossOrigin(origins = "*")
public class YeuCauMuaHangController {

    @Autowired private YeuCauMuaHangRepository yeuCauMuaHangRepository;
    @Autowired private NhaCungCapRepository nhaCungCapRepository;
    @Autowired private HangHoaRepository hangHoaRepository;
    @Autowired private SanPhamNCCRepository sanPhamNCCRepository;
    @Autowired private ThongBaoRepository thongBaoRepository;
    @Autowired private AuditLogService auditLogService; // 🎯 Để ghi log hiện lên Timeline hồ sơ
    @Autowired
    private DonDatHangRepository donDatHangRepository;

    // ========================================================
    // 📦 1. TẠO PHIẾU YÊU CẦU MUA HÀNG (Dành cho Quản lý kho)
    // ========================================================
    @PostMapping
    @Transactional
    public ResponseEntity<?> taoYeuCau(@RequestBody YeuCauMuaRequest request) {
        try {
            YeuCauMuaHang ycm = new YeuCauMuaHang();
            ycm.setMaYeuCau(request.getMaYeuCau());
            String username = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getName();

            ycm.setNguoiTao(username); // Gán "chính chủ" đang login vào đây
            ycm.setGhiChu(request.getGhiChu());
            ycm.setNguoiTao(request.getNguoiTao()); // 🎯 Thống nhất dùng nguoiTao
            ycm.setGhiChu(request.getGhiChu());
            ycm.setTrangThai("Chờ Duyệt");
            ycm.setNgayYeuCau(LocalDateTime.now());

            NhaCungCap ncc = nhaCungCapRepository.findByMaNCC(request.getMaNhaCungCap())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhà cung cấp!"));
            ycm.setNhaCungCap(ncc);

            List<ChiTietYeuCauMua> dsChiTiet = new ArrayList<>();
            for (ChiTietYeuCauMuaRequest item : request.getChiTiets()) {

                // Thuật toán: Tìm trong kho, không có thì "Khai sinh" mới từ báo giá NCC
                HangHoa hangHoa = hangHoaRepository.findById(item.getMaHang())
                        .orElseGet(() -> {
                            SanPhamNCC spNcc = sanPhamNCCRepository.findByMaHangAndNhaCungCap_MaNCC(item.getMaHang(), ncc.getMaNCC())
                                    .orElseThrow(() -> new RuntimeException("Sản phẩm " + item.getMaHang() + " không có trong danh mục NCC!"));

                            HangHoa hhMoi = new HangHoa();
                            hhMoi.setMaHang(spNcc.getMaHang());
                            hhMoi.setTenHang(spNcc.getTenHang());
                            hhMoi.setGiaNhap(spNcc.getGiaBan()); // Giá bán của NCC là giá nhập của mình
                            hhMoi.setGiaBan(spNcc.getGiaBan() != null ? spNcc.getGiaBan() * 1.2 : 0);
                            hhMoi.setSoLuongTon(0);
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

            // 🎯 GHI LOG: Hành động này sẽ hiện lên Tab "Lịch sử hoạt động" của nhân viên
            auditLogService.ghiLog("THÊM", "YÊU CẦU MUA", saved.getMaYeuCau(), "N/A", "Lập đề xuất mua vật tư");

            // 🔔 Rung chuông thông báo cho ADMIN
            ThongBao tb = new ThongBao();
            tb.setTieuDe("💰 Đề xuất mua hàng mới!");
            tb.setNoiDung("Nhân viên " + saved.getNguoiTao() + " vừa gửi yêu cầu " + saved.getMaYeuCau());
            tb.setNguoiNhan("ADMIN");
            tb.setDuongDan("/duyet-yeu-cau-mua");
            thongBaoRepository.save(tb);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo yêu cầu: " + e.getMessage());
        }
    }

    // ========================================================
    // 📋 2. LẤY DANH SÁCH YÊU CẦU
    // ========================================================
    @GetMapping
    public List<YeuCauMuaHang> layTatCaYeuCau(@RequestParam(required = false) String trangThai) {
        if (trangThai != null && !trangThai.isEmpty()) {
            return yeuCauMuaHangRepository.findByTrangThaiOrderByNgayYeuCauDesc(trangThai);
        }
        return yeuCauMuaHangRepository.findAllByOrderByNgayYeuCauDesc();
    }

    // ========================================================
    // 👑 3. DUYỆT HOẶC TỪ CHỐI (Dành cho Sếp/Admin)
    // ========================================================
    @PutMapping("/{maYeuCau}/duyet")
    @Transactional
    public ResponseEntity<?> xetDuyetYeuCau(@PathVariable String maYeuCau, @RequestBody DuyetYeuCauRequest request) {
        try {
            YeuCauMuaHang ycm = yeuCauMuaHangRepository.findById(maYeuCau)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu!"));

            if (!"Chờ Duyệt".equals(ycm.getTrangThai())) {
                return ResponseEntity.badRequest().body("Phiếu này đã được xử lý rồi!");
            }

            String trangThaiCu = ycm.getTrangThai();
            ycm.setTrangThai(request.getTrangThai());
            if ("Từ Chối".equals(request.getTrangThai())) {
                ycm.setLyDoTuChoi(request.getLyDoTuChoi());
            }

            YeuCauMuaHang saved = yeuCauMuaHangRepository.save(ycm);

            // 🎯 GHI LOG: Hành động của Sếp sẽ hiện lên Timeline của Sếp
            auditLogService.ghiLog("DUYỆT", "YÊU CẦU MUA", maYeuCau, trangThaiCu, saved.getTrangThai());

            // 🔔 Thông báo kết quả cho người lập
            ThongBao tb = new ThongBao();
            tb.setTieuDe(saved.getTrangThai().equals("Đã Duyệt") ? "✅ Yêu cầu được duyệt!" : "❌ Yêu cầu bị từ chối!");
            tb.setNoiDung("Phiếu " + maYeuCau + " đã được xử lý: " + saved.getTrangThai());
            tb.setNguoiNhan(saved.getNguoiTao());
            thongBaoRepository.save(tb);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping("/{maYeuCau}/hoan-thanh")
    @Transactional
    public void hoanThanhYeuCau(@PathVariable String maYeuCau) {
        yeuCauMuaHangRepository.findById(maYeuCau).ifPresent(ycm -> {
            ycm.setTrangThai("Đã Lên PO");
            yeuCauMuaHangRepository.save(ycm);
        });
    }
    // ========================================================
    // 🚀 TÍNH NĂNG MỚI: TẠO YÊU CẦU MUA HÀNG LOẠT (TỪ CẢNH BÁO TỒN KHO)
    // ========================================================
    // ========================================================
    // 🚀 TÍNH NĂNG MỚI: TẠO YÊU CẦU MUA HÀNG LOẠT (TỪ CẢNH BÁO TỒN KHO)
    // ========================================================
    @PostMapping("/tao-hang-loat")
    @Transactional
    public ResponseEntity<?> taoYeuCauHangLoat(@RequestBody List<YeuCauMuaRequest> requests) {
        try {
            String username = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getName();

            List<YeuCauMuaHang> savedList = new ArrayList<>();

            for (YeuCauMuaRequest req : requests) {
                YeuCauMuaHang ycm = new YeuCauMuaHang();
                // Tự động sinh mã Yêu Cầu ngẫu nhiên để không bị trùng
                ycm.setMaYeuCau("YCM-AUTO-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000));
                ycm.setNguoiTao(username);
                ycm.setGhiChu(req.getGhiChu());
                ycm.setTrangThai("Chờ Duyệt");
                ycm.setNgayYeuCau(LocalDateTime.now());

                NhaCungCap ncc = nhaCungCapRepository.findByMaNCC(req.getMaNhaCungCap())
                        .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy NCC " + req.getMaNhaCungCap()));
                ycm.setNhaCungCap(ncc);

                List<ChiTietYeuCauMua> dsChiTiet = new ArrayList<>();
                for (ChiTietYeuCauMuaRequest item : req.getChiTiets()) {

                    // 🎯 ĐÃ FIX CHỖ NÀY NÈ SẾP: Phải check xem NCC này có bán món này không!
                    SanPhamNCC spNcc = sanPhamNCCRepository.findByMaHangAndNhaCungCap_MaNCC(item.getMaHang(), ncc.getMaNCC())
                            .orElseThrow(() -> new RuntimeException("Lỗi: Mặt hàng [" + item.getMaHang() + "] không có trong danh sách bán của nhà cung cấp [" + ncc.getTenNCC() + "]."));

                    // 2. 🎯 ĐÃ FIX: Lấy hàng trong kho. Nếu kho chưa có (hàng mới) -> Tự động KHAI SINH vào kho!
                    HangHoa hangHoaTrongKho = hangHoaRepository.findById(item.getMaHang())
                            .orElseGet(() -> {
                                HangHoa hhMoi = new HangHoa();
                                hhMoi.setMaHang(spNcc.getMaHang());
                                hhMoi.setTenHang(spNcc.getTenHang());
                                hhMoi.setGiaNhap(spNcc.getGiaBan()); // Lấy giá NCC làm giá nhập
                                hhMoi.setGiaBan(spNcc.getGiaBan() != null ? spNcc.getGiaBan() * 1.2 : 0); // Tạm tính giá bán lãi 20%
                                hhMoi.setSoLuongTon(0);
                                return hangHoaRepository.save(hhMoi); // Lưu ngay vào kho
                            });

                    ChiTietYeuCauMua chiTiet = new ChiTietYeuCauMua();
                    chiTiet.setYeuCauMuaHang(ycm);
                    chiTiet.setHangHoa(hangHoaTrongKho); // Giờ thì chắc chắn không bị null nữa!
                    chiTiet.setSoLuongCanMua(item.getSoLuongCanMua());
                    dsChiTiet.add(chiTiet);
                }

                ycm.setChiTiets(dsChiTiet);
                savedList.add(yeuCauMuaHangRepository.save(ycm));

                // Ghi log cho từng phiếu
                auditLogService.ghiLog("TẠO TỰ ĐỘNG", "YÊU CẦU MUA", ycm.getMaYeuCau(), "N/A", "Lập tự động từ cảnh báo tồn kho");
            }

            // Rung chuông báo Admin có lô hàng mới
            ThongBao tb = new ThongBao();
            tb.setTieuDe("🚨 Yêu cầu mua khẩn cấp!");
            tb.setNoiDung("Hệ thống vừa dùng tính năng Auto để tạo " + savedList.size() + " phiếu yêu cầu mua hàng.");
            tb.setNguoiNhan("ADMIN");
            tb.setDuongDan("/duyet-yeu-cau-mua");
            thongBaoRepository.save(tb);

            return ResponseEntity.ok("Đã tạo thành công " + savedList.size() + " Yêu cầu mua hàng!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 🚀 TÍNH NĂNG: LẤY DANH SÁCH HÀNG ĐANG TRÊN ĐƯỜNG VỀ (TỪ ĐƠN ĐẶT HÀNG - PO)
    // 🚀 ĐÃ NÂNG CẤP: Lấy danh sách hàng đang về (Kèm theo SỐ LƯỢNG)
    @GetMapping("/hang-dang-cho-ve")
    public ResponseEntity<java.util.Map<String, Integer>> getHangDangChoVeTuPO() {

        // Mốc thời gian 3 ngày
        LocalDateTime mocThoiGian = LocalDateTime.now().minusDays(3);

        List<DonDatHang> activePOs = donDatHangRepository.findAll().stream()
                .filter(po -> !po.getTrangThai().equalsIgnoreCase("Hoàn Tất")
                        && !po.getTrangThai().equalsIgnoreCase("Đã Hủy")
                        && !po.getTrangThai().equalsIgnoreCase("Từ Chối"))
                .filter(po -> po.getNgayTao() != null && po.getNgayTao().isAfter(mocThoiGian))
                .collect(Collectors.toList());

        // 🎯 Dùng Map để lưu: Mã Hàng -> Tổng số lượng đang về
        java.util.Map<String, Integer> hangPendingMap = new java.util.HashMap<>();

        for (DonDatHang po : activePOs) {
            for (ChiTietDonDatHang ct : po.getChiTiets()) {
                if(ct.getHangHoa() != null) {
                    String maHang = ct.getHangHoa().getMaHang();
                    int soLuongDangCho = ct.getSoLuongDat(); // Lấy số lượng đặt của món này

                    // Cộng dồn vào Map
                    hangPendingMap.put(maHang, hangPendingMap.getOrDefault(maHang, 0) + soLuongDangCho);
                }
            }
        }
        return ResponseEntity.ok(hangPendingMap);
    }

    // ========================================================
    // 🏗️ DTOs (Data Transfer Objects)
    // ========================================================
    public static class YeuCauMuaRequest {
        private String maYeuCau;
        private String maNhaCungCap;
        private String nguoiTao; // 🎯 Phải là nguoiTao
        private String ghiChu;
        private List<ChiTietYeuCauMuaRequest> chiTiets;

        public String getMaYeuCau() { return maYeuCau; }
        public void setMaYeuCau(String maYeuCau) { this.maYeuCau = maYeuCau; }
        public String getMaNhaCungCap() { return maNhaCungCap; }
        public void setMaNhaCungCap(String maNhaCungCap) { this.maNhaCungCap = maNhaCungCap; }
        public String getNguoiTao() { return nguoiTao; }
        public void setNguoiTao(String nguoiTao) { this.nguoiTao = nguoiTao; }
        public String getGhiChu() { return ghiChu; }
        public void setGhiChu(String ghiChu) { this.ghiChu = ghiChu; }
        public List<ChiTietYeuCauMuaRequest> getChiTiets() { return chiTiets; }
        public void setChiTiets(List<ChiTietYeuCauMuaRequest> chiTiets) { this.chiTiets = chiTiets; }
    }

    public static class ChiTietYeuCauMuaRequest {
        private String maHang;
        private Integer soLuongCanMua;

        public String getMaHang() { return maHang; }
        public void setMaHang(String maHang) { this.maHang = maHang; }
        public Integer getSoLuongCanMua() { return soLuongCanMua; }
        public void setSoLuongCanMua(Integer soLuongCanMua) { this.soLuongCanMua = soLuongCanMua; }
    }

    public static class DuyetYeuCauRequest {
        private String trangThai;
        private String lyDoTuChoi;

        public String getTrangThai() { return trangThai; }
        public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
        public String getLyDoTuChoi() { return lyDoTuChoi; }
        public void setLyDoTuChoi(String lyDoTuChoi) { this.lyDoTuChoi = lyDoTuChoi; }
    }
}