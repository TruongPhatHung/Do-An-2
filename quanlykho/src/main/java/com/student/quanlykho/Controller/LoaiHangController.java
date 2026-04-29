package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.LoaiHang;
import com.student.quanlykho.Repository.LoaiHangRepository;
import com.student.quanlykho.Service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class LoaiHangController {

    @Autowired
    private LoaiHangRepository loaiHangRepository;

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public List<LoaiHang> getAll() {
        return loaiHangRepository.findAll();
    }

    @PostMapping
    public LoaiHang create(@RequestBody LoaiHang loaiHang) {
        LoaiHang saved = loaiHangRepository.save(loaiHang);

        // Ghi log
        auditLogService.ghiLog("THÊM", "LOẠI HÀNG / DANH MỤC", saved.getMaLoai(),
                "Chưa có", "Tạo danh mục mới: " + saved.getTenLoai());
        return saved;
    }

    @PutMapping("/{id}")
    public LoaiHang update(@PathVariable Long id, @RequestBody LoaiHang request) {
        return loaiHangRepository.findById(id).map(loaiHang -> {
            String cu = "Tên loại: " + loaiHang.getTenLoai();

            loaiHang.setMaLoai(request.getMaLoai());
            loaiHang.setTenLoai(request.getTenLoai());
            loaiHang.setMoTa(request.getMoTa());
            LoaiHang saved = loaiHangRepository.save(loaiHang);

            String moi = "Tên loại: " + saved.getTenLoai();
            if(!cu.equals(moi)) {
                auditLogService.ghiLog("SỬA", "LOẠI HÀNG / DANH MỤC", id.toString(), cu, moi);
            }
            return saved;
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy loại hàng"));
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        LoaiHang lh = loaiHangRepository.findById(id).orElse(null);
        if(lh != null) {
            auditLogService.ghiLog("XÓA", "LOẠI HÀNG / DANH MỤC", id.toString(), lh.getTenLoai(), "Đã xóa");
            loaiHangRepository.deleteById(id);
        }
        return "Xóa thành công";
    }
}
