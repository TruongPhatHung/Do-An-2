package com.student.quanlykho.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
@Data
@Entity
@Table(name = "phieu_kiem_ke")
public class PhieuKiemKe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String maHang;
    private String tenHang;
    private int tonPhanMem; // Số cũ trong máy
    private int tonThucTe;   // Số nhân viên vừa đếm
    private int chenhLech;
    private String ghiChu;
    private String nguoiKiemKe;
    private LocalDateTime ngayKiemKe = LocalDateTime.now();

    // Trạng thái: 0: Chờ Duyệt, 1: Đã Duyệt & Cập nhật kho, 2: Đã Hủy
    private int trangThai = 0;

    // Getters and Setters...
}
