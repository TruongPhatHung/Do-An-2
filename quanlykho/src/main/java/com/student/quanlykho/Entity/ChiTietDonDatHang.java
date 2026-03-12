package com.student.quanlykho.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "chi_tiet_don_hang")
@Data
public class ChiTietDonDatHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ma_don")
    @JsonIgnore // Tránh lặp vô tận khi chuyển sang JSON
    private DonDatHang donDatHang;

    @Column(name = "ma_hang")
    private String maHang;

    @Column(name = "ten_hang")
    private String tenHang;
    @Column(name = "so_luong_dat")
    private int soLuongDat; // Số lượng muốn mua [cite: 77]

    @Column(name = "so_luong_da_nhap")
    private int soLuongDaNhap = 0; // Field này cực quan trọng để tính toán Giao thiếu

    @Column(name = "don_gia")
    private Double donGia; // Giá nhập thỏa thuận
}
