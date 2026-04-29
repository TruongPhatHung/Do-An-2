package com.student.quanlykho.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "chi_tiet_yeu_cau_xuat")
@Data
public class ChiTietYeuCauXuat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "yeu_cau_xuat_id", referencedColumnName = "ma_yeu_cau")
    private YeuCauXuatKho yeuCauXuatKho;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ma_hang", referencedColumnName = "ma_hang")
    private HangHoa hangHoa;

    @Column(name = "so_luong_yeu_cau", nullable = false)
    private Integer soLuongYeuCau;

    @Column(name = "so_luong_da_xuat")

    private Integer soLuongDaXuat; // Dùng để theo dõi xem kho đã nhặt đủ hàng chưa

    @PrePersist
    protected void onCreate() {
        if (this.soLuongDaXuat == 0) {
            this.soLuongDaXuat = 0;
        }
    }
}