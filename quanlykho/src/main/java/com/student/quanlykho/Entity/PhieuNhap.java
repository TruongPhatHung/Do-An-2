package com.student.quanlykho.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "phieu_nhap")
@Data
public class PhieuNhap {
    @Id
    @Column(name = "ma_phieu_nhap")
    private String maPhieuNhap; // Ví dụ: PN-01

    @Column(name = "ngay_nhap")
    private LocalDateTime ngayNhap = LocalDateTime.now();

    // Phiếu nhập này thuộc về Đơn hàng nào?
    @ManyToOne
    @JoinColumn(name = "ma_don_dat_hang")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private DonDatHang donDatHang;
}
