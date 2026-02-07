package com.student.quanlykho.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "nguoi_dung")
@Data
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "vai_tro", discriminatorType = DiscriminatorType.STRING)
public class NguoiDung {
    @Id
    private String maND;
    private String hoTen;

    private String matKhau;

    @Column(insertable = false, updatable = false)
    private String vaiTro;

}
