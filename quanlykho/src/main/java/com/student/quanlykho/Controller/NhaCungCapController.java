package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.NhaCungCap;
import com.student.quanlykho.Entity.SanPhamNCC;
import com.student.quanlykho.Repository.NhaCungCapRepository;
import com.student.quanlykho.Repository.SanPhamNCCRepository; // 1. IMPORT THÊM REPOSITORY
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin(origins = "*")
public class NhaCungCapController {

    @Autowired
    private NhaCungCapRepository nhaCungCapRepository;

    @Autowired
    private SanPhamNCCRepository sanPhamNCCRepository; // 2. KHAI BÁO REPOSITORY BẢNG CON

    @GetMapping
    public List<NhaCungCap> getAll(){
        return nhaCungCapRepository.findAll();
    }

    // 3. ĐÃ XÓA @PostMapping CŨ BỊ TRÙNG LẶP
    // Giữ lại API này để nhận form lồng nhau từ React
    @PostMapping
    public NhaCungCap createSupplierWithProducts(@RequestBody NhaCungCapRequest request) {
        // 1. Lưu NCC
        NhaCungCap ncc = new NhaCungCap();
        ncc.setMaNCC(request.getMaNCC());
        ncc.setTenNCC(request.getTenNCC());
        ncc.setDiaChi(request.getDiaChi());
        ncc.setEmail(request.getEmail());

        NhaCungCap savedNcc = nhaCungCapRepository.save(ncc);

        // 2. Lưu danh mục hàng hóa của NCC đó vào BẢNG CON
        if (request.getDanhSachHangHoa() != null && !request.getDanhSachHangHoa().isEmpty()) {
            for (HangHoaRequest item : request.getDanhSachHangHoa()) {
                // Bỏ qua nếu người dùng để trống 1 dòng trên giao diện React
                if(item.getMaHang() == null || item.getMaHang().trim().isEmpty()) continue;

                SanPhamNCC sp = new SanPhamNCC();
                sp.setMaHang(item.getMaHang());
                sp.setTenHang(item.getTenHang());
                sp.setGiaBan(item.getGiaBan());
                sp.setNhaCungCap(savedNcc);

                sanPhamNCCRepository.save(sp);
            }
        }
        return savedNcc;
    }

    @PutMapping("/{id}")
    public NhaCungCap update(@PathVariable Long id, @RequestBody NhaCungCapRequest request){
        return nhaCungCapRepository.findById(id)
                .map(nhaCungCap -> {
                    nhaCungCap.setMaNCC(request.getMaNCC());
                    nhaCungCap.setTenNCC(request.getTenNCC());
                    nhaCungCap.setDiaChi(request.getDiaChi());
                    nhaCungCap.setEmail(request.getEmail()); // 4. THÊM CẬP NHẬT EMAIL
                    return nhaCungCapRepository.save(nhaCungCap);
                })
                .orElseThrow(()-> new RuntimeException("Không tìm thấy nhà cung cấp: " + id));
    }

    @DeleteMapping("/{id}")
    public String deleteNhaCungCap(@PathVariable Long id) {
        nhaCungCapRepository.deleteById(id);
        return "Xóa nhà cung cấp " + id + " thành công";
    }

    // --- 5. TẠO CLASS DTO TẠI ĐÂY ĐỂ NHẬN DỮ LIỆU TỪ REACT ---
    public static class NhaCungCapRequest {
        private String maNCC;
        private String tenNCC;
        private String diaChi;
        private String email;
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
    }

    public static class HangHoaRequest {
        private String maHang;
        private String tenHang;
        private Double giaBan;

        public String getMaHang() { return maHang; }
        public void setMaHang(String maHang) { this.maHang = maHang; }
        public String getTenHang() { return tenHang; }
        public void setTenHang(String tenHang) { this.tenHang = tenHang; }
        public Double getGiaBan() { return giaBan; }
        public void setGiaBan(Double giaBan) { this.giaBan = giaBan; }
    }
}