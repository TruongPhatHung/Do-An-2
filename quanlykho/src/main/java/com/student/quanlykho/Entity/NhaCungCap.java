package com.student.quanlykho.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "nha_cung_cap")
public class NhaCungCap {

    @Id
    private String maNCC;
    private String temNCC;
    private String diaChi;
}
