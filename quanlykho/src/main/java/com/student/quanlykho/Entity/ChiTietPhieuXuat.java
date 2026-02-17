package com.student.quanlykho.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.Id;
@Data
@Table(name = "chi_tiet_phieu_xuat")
public class ChiTietPhieuXuat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ma_phieu_xuat")
    @JsonIgnore
    private PhieuXuat phieuXuat;

    @ManyToOne
    @JoinColumn(name = "ma_hang")
    private HangHoa hangHoa;

    @Column(name = "so_luong_xuat")
    private int soLuongXuat;

}
