package com.student.quanlykho.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "chi_tiet_phieu_nhap")
@Data
public class ChiTietPhieuNhap {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ma_phieu_nhap")
    @JsonBackReference
    private PhieuNhap phieuNhap;

    @ManyToOne
    @JoinColumn(name = "ma_hang")
    private HangHoa hangHoa;

    private Integer soLuong;
    private Double donGia; // Giá tại thời điểm nhập (lấy từ PO sang)
}