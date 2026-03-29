package com.student.quanlykho.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "thong_bao")
@Data
public class ThongBao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tieuDe;
    private String noiDung;
    private String nguoiNhan; // Có thể là Username hoặc Role (VD: "ADMIN", "KHO")
    private String duongDan; // Click vào thông báo thì bay tới trang nào? (VD: "/duyet-yeu-cau-xuat")

    private boolean daDoc = false;
    private LocalDateTime ngayTao = LocalDateTime.now();
}