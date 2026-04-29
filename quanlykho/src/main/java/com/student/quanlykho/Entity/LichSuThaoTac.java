package com.student.quanlykho.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class LichSuThaoTac {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nguoiThaoTac; // Lưu tên đăng nhập
    private String hanhDong;     // THÊM, SỬA, XÓA
    private String bangDuLieu;   // NHÀ CUNG CẤP, HÀNG HÓA, NGƯỜI DÙNG...
    private String idBanGhi;     // ID của bản ghi bị tác động

    @Column(columnDefinition = "TEXT")
    private String duLieuCu;     // Nội dung trước khi sửa

    @Column(columnDefinition = "TEXT")
    private String duLieuMoi;    // Nội dung sau khi sửa

    private LocalDateTime thoiGian;
}