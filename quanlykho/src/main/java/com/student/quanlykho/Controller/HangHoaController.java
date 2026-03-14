package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.HangHoa;
import com.student.quanlykho.Repository.HangHoaRepository;
import com.student.quanlykho.Service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class HangHoaController {

    @Autowired
    private HangHoaRepository hangHoaRepository;

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public List<HangHoa> getAll(){
        return hangHoaRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public HangHoa create(@RequestBody HangHoa hangHoa){
        HangHoa saved = hangHoaRepository.save(hangHoa);

        // 🎯 GHI LOG: THÊM HÀNG HÓA
        String moi = String.format("Tên: %s, Tồn: %d, Giá Nhập: %s",
                saved.getTenHang(), saved.getSoLuongTon(), saved.getGiaNhap());
        auditLogService.ghiLog("THÊM", "HÀNG HÓA", saved.getMaHang(), "Chưa có", moi);

        return saved;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public HangHoa update(@PathVariable String id, @RequestBody HangHoa hangHoaMoi){
        return hangHoaRepository.findById(id).map(hangHoa -> {

            // 1. Lưu lại thông tin cũ
            String cu = String.format("Tên: %s, Tồn: %d, Giá Nhập: %s",
                    hangHoa.getTenHang(), hangHoa.getSoLuongTon(), hangHoa.getGiaNhap());

            // 2. Cập nhật
            hangHoa.setTenHang(hangHoaMoi.getTenHang());
            hangHoa.setSoLuongTon(hangHoaMoi.getSoLuongTon());
            hangHoa.setGiaNhap(hangHoaMoi.getGiaNhap());
            hangHoa.setDonViTinh(hangHoaMoi.getDonViTinh());
            hangHoa.setSoLuongToiThieu(hangHoaMoi.getSoLuongToiThieu());
            HangHoa saved = hangHoaRepository.save(hangHoa);

            // 3. Lấy thông tin mới
            String moi = String.format("Tên: %s, Tồn: %d, Giá Nhập: %s",
                    saved.getTenHang(), saved.getSoLuongTon(), saved.getGiaNhap());

            // 🎯 CHỈ GHI LOG NẾU CÓ SỰ THAY ĐỔI
            if (!cu.equals(moi)) {
                auditLogService.ghiLog("SỬA", "HÀNG HÓA", id, cu, moi);
            }

            return saved;
        }).orElseThrow(()-> new RuntimeException("không tìm thấy hàng hóa:"+ id ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public void delete(@PathVariable String id){
        HangHoa hh = hangHoaRepository.findById(id).orElse(null);
        if(hh != null) {
            // 🎯 GHI LOG: XÓA HÀNG HÓA
            String cu = String.format("Tên: %s, Tồn: %d", hh.getTenHang(), hh.getSoLuongTon());
            auditLogService.ghiLog("XÓA", "HÀNG HÓA", id, cu, "Đã xóa khỏi hệ thống");
            hangHoaRepository.deleteById(id);
        }
    }
}