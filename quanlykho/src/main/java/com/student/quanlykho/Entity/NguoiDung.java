package com.student.quanlykho.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "nguoi_dung")
@Data
public class NguoiDung {
    @Id
    @Column(name = "ma_nd")
    private String maND;

    @Column(name = "ten_dang_nhap", unique = true)
    private String tenDangNhap;
    @Column(name = "ngay_tao")
    private LocalDate ngayTao;
    @Column(name = "ho_ten")
    private String hoTen;

    @Column(name = "mat_khau")
    private String matKhau;

    @Column(name = "vai_tro")
    private String vaiTro;

    @Column(name = "so_dt")
    @com.fasterxml.jackson.annotation.JsonProperty("so_dt") // 🎯 Ép JSON trả về đúng tên này
    private String soDT;

    @Column(name = "email")
    private String email;

    // 🎯 ĐỊA CHỈ ĐÃ ĐƯỢC CHỐT HẠ
    @Column(name = "dia_chi", columnDefinition = "TEXT")
    private String diaChi;
    @Column(name = "gioi_tinh")
    private String gioiTinh; // Nam, Nữ, Khác

    @Column(name = "ngay_sinh")
    private LocalDate ngaySinh;

    private String avatar;

    @Column(name = "last_active_time")
    private LocalDateTime lastActiveTime;

    @Column(name = "is_online")
    private Boolean isOnline = false;
}
