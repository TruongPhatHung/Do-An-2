package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.LoaiHang;
import com.student.quanlykho.Entity.NhaCungCap;
import com.student.quanlykho.Entity.SanPhamNCC;
import com.student.quanlykho.Repository.LoaiHangRepository;
import com.student.quanlykho.Repository.NhaCungCapRepository;
import com.student.quanlykho.Repository.SanPhamNCCRepository;
import com.student.quanlykho.Service.AuditLogService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin(origins = "*")
public class NhaCungCapController {

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private NhaCungCapRepository nhaCungCapRepository;

    @Autowired
    private SanPhamNCCRepository sanPhamNCCRepository;
    @Autowired
    private LoaiHangRepository loaiHangRepository;

    @GetMapping
    public List<NhaCungCap> getAll() {
        return nhaCungCapRepository.findAll();
    }

    @GetMapping("/{id}")
    public NhaCungCap getById(@PathVariable Long id) {
        return nhaCungCapRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy NCC: " + id));
    }

    @PostMapping
    @Transactional
    public NhaCungCap create(@RequestBody NhaCungCapRequest request) {
        NhaCungCap ncc = new NhaCungCap();
        ncc.setMaNCC(request.getMaNCC());
        ncc.setTenNCC(request.getTenNCC());
        ncc.setDiaChi(request.getDiaChi());
        ncc.setEmail(request.getEmail());
        if (request.getLoaiHangId() != null) {
            LoaiHang loaiHang = loaiHangRepository.findById(request.getLoaiHangId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Loại hàng này"));
            ncc.setLoaiHang(loaiHang);
        }
        NhaCungCap saved = nhaCungCapRepository.save(ncc);

        // Lưu hàng hóa con
        saveProducts(request.getDanhSachHangHoa(), saved);

        // Ghi nhật ký: 5 tham số (Hành động, Bảng, ID, Cũ, Mới)
        String moi = String.format("Mã: %s, Tên: %s", saved.getMaNCC(), saved.getTenNCC());
        auditLogService.ghiLog("THÊM", "NHÀ CUNG CẤP", saved.getId().toString(), "Dữ liệu mới", moi);

        return saved;
    }


    @PutMapping("/{id}")
    @Transactional
    public NhaCungCap update(@PathVariable Long id, @RequestBody NhaCungCapRequest request) {
        return nhaCungCapRepository.findById(id).map(ncc -> {

            // ==========================================
            // 1. GHI LOG CHO THÔNG TIN CÔNG TY
            // ==========================================
            String nccCu = String.format("Tên: %s, ĐC: %s", ncc.getTenNCC(), ncc.getDiaChi());

            ncc.setMaNCC(request.getMaNCC());
            ncc.setTenNCC(request.getTenNCC());
            ncc.setDiaChi(request.getDiaChi());
            ncc.setEmail(request.getEmail());
            if (request.getLoaiHangId() != null) {
                LoaiHang loaiHang = loaiHangRepository.findById(request.getLoaiHangId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy Loại hàng này"));
                ncc.setLoaiHang(loaiHang);
            } else {
                ncc.setLoaiHang(null); // Nếu người dùng bỏ chọn loại hàng
            }
            NhaCungCap saved = nhaCungCapRepository.save(ncc);

            String nccMoi = String.format("Tên: %s, ĐC: %s", saved.getTenNCC(), saved.getDiaChi());

            // Chỉ ghi log Sửa Công ty nếu thông tin công ty thật sự bị đổi
            if (!nccCu.equals(nccMoi)) {
                auditLogService.ghiLog("SỬA", "NHÀ CUNG CẤP", id.toString(), nccCu, nccMoi);
            }

            // ==========================================
            // 2. THUẬT TOÁN SO SÁNH HÀNG HÓA CON
            // ==========================================
            // Lấy danh sách hàng cũ đưa vào Map để dễ tìm kiếm
            Map<String, SanPhamNCC> oldProductsMap = new HashMap<>();
            if (ncc.getDanhSachHangHoa() != null) {
                for (SanPhamNCC sp : ncc.getDanhSachHangHoa()) {
                    oldProductsMap.put(sp.getMaHang(), sp);
                }
            }

            // Xóa sạch hàng cũ trong DB để nạp hàng mới (Tránh lỗi nhân bản)
            sanPhamNCCRepository.xoaToanBoSanPhamCuaNcc(id);

            if (request.getDanhSachHangHoa() != null) {
                for (HangHoaRequest newItem : request.getDanhSachHangHoa()) {
                    if (newItem.getMaHang() == null || newItem.getMaHang().trim().isEmpty()) continue;

                    // Lưu hàng hóa mới vào DB
                    SanPhamNCC sp = new SanPhamNCC();
                    sp.setMaHang(newItem.getMaHang());
                    sp.setTenHang(newItem.getTenHang());
                    sp.setGiaBan(newItem.getGiaBan());
                    sp.setNhaCungCap(saved);
                    sanPhamNCCRepository.save(sp);

                    // --- BẮT ĐẦU SOI LỖI ĐỂ GHI LOG ---
                    if (oldProductsMap.containsKey(newItem.getMaHang())) {
                        // Tình huống 1: Hàng đã tồn tại -> Kiểm tra xem có bị SỬA giá không
                        SanPhamNCC oldItem = oldProductsMap.get(newItem.getMaHang());

                        if (!Objects.equals(oldItem.getGiaBan(), newItem.getGiaBan()) ||
                                !Objects.equals(oldItem.getTenHang(), newItem.getTenHang())) {

                            String hhCu = String.format("Tên: %s, Giá: %s", oldItem.getTenHang(), oldItem.getGiaBan());
                            String hhMoi = String.format("Tên: %s, Giá: %s", newItem.getTenHang(), newItem.getGiaBan());

                            // Ghi log chi tiết món hàng bị sửa
                            auditLogService.ghiLog("SỬA", "HÀNG HÓA (BẢNG BÁO GIÁ)", newItem.getMaHang(), hhCu, hhMoi);
                        }

                        // Khám xong thì gạch tên món này khỏi danh sách cũ
                        oldProductsMap.remove(newItem.getMaHang());

                    } else {
                        // Tình huống 2: Mã hàng này không có trong danh sách cũ -> Đây là HÀNG THÊM MỚI
                        String hhMoi = String.format("Tên SP: %s, Giá: %s", newItem.getTenHang(), newItem.getGiaBan());
                        auditLogService.ghiLog("THÊM", "HÀNG HÓA (BẢNG BÁO GIÁ)", newItem.getMaHang(), "Không có", hhMoi);
                    }
                }
            }

            // Tình huống 3: Những mặt hàng còn sót lại trong oldProductsMap chính là những mặt hàng bị XÓA
            for (SanPhamNCC deletedItem : oldProductsMap.values()) {
                String hhCu = String.format("Tên SP: %s, Giá: %s", deletedItem.getTenHang(), deletedItem.getGiaBan());
                auditLogService.ghiLog("XÓA", "HÀNG HÓA (BẢNG BÁO GIÁ)", deletedItem.getMaHang(), hhCu, "Đã bị xóa khỏi bảng báo giá");
            }

            return saved;
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy NCC: " + id));
    }
    @DeleteMapping("/{id}")
    @Transactional
    public String delete(@PathVariable Long id) {
        NhaCungCap ncc = nhaCungCapRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy NCC"));

        auditLogService.ghiLog("XÓA", "NHÀ CUNG CẤP", id.toString(), ncc.getTenNCC(), "Đã xóa khỏi hệ thống");

        nhaCungCapRepository.deleteById(id);
        return "Xóa thành công";
    }

    // Hàm phụ để lưu danh sách hàng hóa tránh lặp code
    private void saveProducts(List<HangHoaRequest> items, NhaCungCap ncc) {
        if (items != null) {
            for (HangHoaRequest item : items) {
                if (item.getMaHang() == null || item.getMaHang().isEmpty()) continue;
                SanPhamNCC sp = new SanPhamNCC();
                sp.setMaHang(item.getMaHang());
                sp.setTenHang(item.getTenHang());
                sp.setGiaBan(item.getGiaBan());
                sp.setNhaCungCap(ncc);
                sanPhamNCCRepository.save(sp);
            }
        }
    }

    // --- Các DTO class (Giữ nguyên) ---
    public static class NhaCungCapRequest {
        private String maNCC, tenNCC, diaChi, email;
        private Long loaiHangId;
        private List<HangHoaRequest> danhSachHangHoa;
        public String getMaNCC() { return maNCC; }
        public void setMaNCC(String maNCC) { this.maNCC = maNCC; }
        public String getTenNCC() { return tenNCC; }
        public void setTenNCC(String tenNCC) { this.tenNCC = tenNCC; }
        public String getDiaChi() { return diaChi; }
        public void setDiaChi(String diaChi) { this.diaChi = diaChi; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public List<HangHoaRequest> getDanhSachHangHoa() { return danhSachHangHoa; }
        public void setDanhSachHangHoa(List<HangHoaRequest> danhSachHangHoa) { this.danhSachHangHoa = danhSachHangHoa; }
        public Long getLoaiHangId() { return loaiHangId; }
        public void setLoaiHangId(Long loaiHangId) { this.loaiHangId = loaiHangId; }
    }

    public static class HangHoaRequest {
        private String maHang, tenHang;
        private Double giaBan;
        public String getMaHang() { return maHang; }
        public void setMaHang(String maHang) { this.maHang = maHang; }
        public String getTenHang() { return tenHang; }
        public void setTenHang(String tenHang) { this.tenHang = tenHang; }
        public Double getGiaBan() { return giaBan; }
        public void setGiaBan(Double giaBan) { this.giaBan = giaBan; }
    }
}