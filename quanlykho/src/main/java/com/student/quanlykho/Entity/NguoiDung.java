package com.student.quanlykho.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

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
    @Column(name = "vai_tro")
    @com.fasterxml.jackson.annotation.JsonProperty("vaiTro")
    private String vaiTro;
    @Column(name = "so_dt")
    private String soDT;
    @Column(name = "email")
    @com.fasterxml.jackson.annotation.JsonProperty("email")
    private String email;
    private String avatar;
    @Column(name = "last_active_time")
    private LocalDateTime lastActiveTime;
}
