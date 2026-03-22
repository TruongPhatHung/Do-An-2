package com.student.quanlykho.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "yeu_cau_xuat_kho")
@Data
public class YeuCauXuatKho {

    @Id
    @Column(name = "ma_yeu_cau", length = 50)
    private String maYeuCau; // Ví dụ: YCX-170123456

    @Column(name = "noi_nhan", nullable = false)
    private String noiNhan; // Đại lý A, Xưởng B, Khách hàng C...

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "ngay_can_xuat")
    private LocalDateTime ngayCanXuat; // Hạn chót để nhân viên kho chuẩn bị

    @Column(name = "trang_thai", length = 50)
    private String trangThai; // "Chờ Xuất", "Đang Xử Lý", "Hoàn Thành", "Đã Hủy"

    @Column(name = "nguoi_tao", length = 50)
    private String nguoiTao; // User name của Quản lý / NV Bán hàng tạo lệnh này

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @OneToMany(mappedBy = "yeuCauXuatKho", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("yeuCauXuatKho")
    private List<ChiTietYeuCauXuat> chiTiets;

    @PrePersist
    protected void onCreate() {
        this.ngayTao = LocalDateTime.now();
        if (this.trangThai == null) {
            this.trangThai = "Chờ Xuất"; // Mặc định khi mới tạo
        }
    }
}