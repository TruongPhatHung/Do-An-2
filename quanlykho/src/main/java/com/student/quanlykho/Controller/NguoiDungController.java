package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.NguoiDung;
import com.student.quanlykho.Repository.NguoiDungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
// ĐÂY MỚI LÀ ĐƯỜNG DẪN ĐÚNG MÀ REACT ĐANG GỌI TỚI
@RequestMapping("/api/users")
public class NguoiDungController {

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    // Lấy danh sách tài khoản
    @GetMapping
    public List<NguoiDung> getAllUsers(){
        return nguoiDungRepository.findAll();
    }

    // Cập nhật tài khoản
    @PutMapping("/{id}")
    public NguoiDung updateUser(@PathVariable String id, @RequestBody NguoiDung userMoi) {
        return nguoiDungRepository.findById(id)
                .map(user -> {
                    user.setHoTen(userMoi.getHoTen());
                    user.setVaiTro(userMoi.getVaiTro());
                    user.setEmail(userMoi.getEmail());
                    user.setSoDT(userMoi.getSoDT());
                    return nguoiDungRepository.save(user);
                })
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản: " + id));
    }

    // Xóa tài khoản
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        nguoiDungRepository.deleteById(id);
    }
}