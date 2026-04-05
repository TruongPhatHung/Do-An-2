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
    @JsonIgnore
    private DonDatHang donDatHang;

    // 🎯 THAY ĐỔI 1: Nối thẳng vào Thực thể HangHoa.
    // Lúc này sếp gọi ct.getHangHoa().getTenHang() là ra tên, không cần lưu dư thừa nữa!
    @ManyToOne
    @JoinColumn(name = "ma_hang")
    private HangHoa hangHoa;

    @Column(name = "so_luong_dat")
    private int soLuongDat;

    // 🎯 THAY ĐỔI 2: Dùng `int` nguyên thủy thay vì `Integer` Object.
    // Mặc định nó sẽ là 0, vĩnh viễn không bao giờ xuất hiện lỗi NULL nữa!
    @Column(name = "so_luong_da_nhap", columnDefinition = "int default 0")
    private int soLuongDaNhap = 0;

    @Column(name = "don_gia")
    private Double donGia;
}