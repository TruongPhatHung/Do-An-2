package com.student.quanlykho.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "nguoi_dung")
@Data
public class NguoiDung {
    @Id
    @Column(name = "ma_nd")
    private String maND;
    @Column(name = "ten_dang_nhap", unique = true) // Tài khoản không được trùng
    private String tenDangNhap;
    @Column(name = "ho_ten")
    private String hoTen;
    @Column(name = "mat_khau")
    private String matKhau;
    @Column(name = "vai_tro", insertable = false, updatable = false)
    private String vaiTro;
    @Column(name = "so_dt")
    private int soDT;
    @Column(name = "email")
    private String email;
}
