package com.student.quanlykho.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "trao_doi_don_hang")
@Data
public class TraoDoiDonHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Gắn với Lệnh Yêu Cầu Xuất nào? (VD: YCX-123)
    @Column(name = "ma_yeu_cau", nullable = false)
    private String maYeuCau;

    // Ai là người gửi? (VD: "KHO_NV1", "KHACH_HANG_A")
    @Column(name = "nguoi_gui", nullable = false)
    private String nguoiGui;

    // Phân loại vai trò để UI hiển thị tin nhắn bên trái hay bên phải
    // "INTERNAL" (Nội bộ Kho/Công ty) hoặc "EXTERNAL" (Khách hàng/Đối tác)
    @Column(name = "vai_tro", nullable = false)
    private String vaiTro;

    @Column(name = "noi_dung", columnDefinition = "TEXT", nullable = false)
    private String noiDung;

    @Column(name = "thoi_gian")
    private LocalDateTime thoiGian;

    @PrePersist
    protected void onCreate() {
        this.thoiGian = LocalDateTime.now();
    }
}