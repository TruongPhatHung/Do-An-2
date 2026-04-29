package com.student.quanlykho.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class LoaiHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String maLoai; // Ví dụ: THUCPHAM, LINHKIEN_PC, AUTO

    private String tenLoai; // Thực phẩm chế biến, Linh kiện máy tính...

    private String moTa; // Ghi chú thêm
}