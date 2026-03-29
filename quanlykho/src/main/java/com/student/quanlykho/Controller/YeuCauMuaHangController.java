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
    private YeuCauMuaHangRepository yeuCauMuaHangRepository;

    @Autowired
    private NhaCungCapRepository nhaCungCapRepository;

    @Autowired
    private HangHoaRepository hangHoaRepository;

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
            HangHoa hangHoa = hangHoaRepository.findById(item.getMaHang())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy mã hàng: " + item.getMaHang()));

            ChiTietYeuCauMua chiTiet = new ChiTietYeuCauMua();
            chiTiet.setYeuCauMuaHang(ycm);
            chiTiet.setHangHoa(hangHoa);
            chiTiet.setSoLuongCanMua(item.getSoLuongCanMua());

            dsChiTiet.add(chiTiet);
        }

        ycm.setChiTiets(dsChiTiet);
        return yeuCauMuaHangRepository.save(ycm);
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

        return yeuCauMuaHangRepository.save(ycm);
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