package com.student.quanlykho.Entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("KHO")
public class NhanVienKho extends NguoiDung{
}
