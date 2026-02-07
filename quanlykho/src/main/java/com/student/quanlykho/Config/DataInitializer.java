package com.student.quanlykho.Config;

import com.student.quanlykho.Entity.Admin;
import com.student.quanlykho.Entity.NhanVienKho;
import com.student.quanlykho.Repository.NguoiDungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired
    private NguoiDungRepository nguoiDungRepository;
    @Override
    public void run(String... args) throws Exception{
        if(nguoiDungRepository.count() ==0){
            Admin admin1 = new Admin();
            admin1.setMaND("ADMIN1");
            admin1.setHoTen("Trương Hoàng Bảo");
            admin1.setMatKhau("admin12345");
            nguoiDungRepository.save(admin1);

            Admin admin2 = new Admin();
            admin2.setMaND("ADMIN2");
            admin2.setHoTen("Trương Phát Hưng");
            admin2.setMatKhau("admin12345");
            nguoiDungRepository.save(admin2);

            NhanVienKho nhanVienKho = new NhanVienKho();
            nhanVienKho.setMaND("001");
            nhanVienKho.setHoTen("Nguyễn Văn A");
            nhanVienKho.setMatKhau("nvk123456");
            nguoiDungRepository.save(nhanVienKho);
            System.out.println(">>> Đã khởi tạo tài khoản mẫu");

        }
    }
}
