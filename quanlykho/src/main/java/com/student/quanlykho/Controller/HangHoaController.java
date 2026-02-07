package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.HangHoa;
import com.student.quanlykho.Repository.HangHoaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class HangHoaController {
    @Autowired
    private HangHoaRepository hangHoaRepository;

    @GetMapping
    public List<HangHoa> getAllProducts(){
        return hangHoaRepository.findAll();
    }
    @PostMapping
    public HangHoa createproducts(@RequestBody HangHoa hangHoa){
        return hangHoaRepository.save(hangHoa);
    }
    @GetMapping("/warning")
    public List<HangHoa> getWarningProducts(){
        return hangHoaRepository.findBySoLuongTonLessThan(20);
    }
}
