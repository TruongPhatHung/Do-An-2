package com.student.quanlykho.Config;


import com.student.quanlykho.Security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;



import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http ) throws Exception {
        http.cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
<<<<<<< HEAD
                       
                        // Mở cửa cho phép đăng nhập, đăng ký không cần token
=======
                        // 1. MỞ CỬA TỰ DO (Không cần đăng nhập)
>>>>>>> 7f8ac94a85e32be5c342862a88c613f7b1d100e8
                        .requestMatchers("/api/auth/**").permitAll()

                        // 2. QUẢN LÝ TÀI KHOẢN (Chỉ Admin)
                        .requestMatchers("/api/users/**").hasAuthority("ADMIN")

                        // 3. QUẢN LÝ NHÀ CUNG CẤP (Suppliers)
                        .requestMatchers(HttpMethod.GET, "/api/suppliers/**").authenticated() // Ai đăng nhập cũng được xem
                        .requestMatchers(HttpMethod.POST, "/api/suppliers/**").hasAnyAuthority("ADMIN", "MUAHANG")
                        .requestMatchers(HttpMethod.PUT, "/api/suppliers/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/suppliers/**").hasAuthority("ADMIN")

                        // 4. QUẢN LÝ LÊN ĐƠN HÀNG (Orders / PO)
                        .requestMatchers(HttpMethod.GET, "/api/orders/**").hasAnyAuthority("ADMIN", "MUAHANG", "KHO") // KHO cần xem để biết sắp có hàng về
                        .requestMatchers(HttpMethod.POST, "/api/orders/**").hasAnyAuthority("ADMIN", "MUAHANG")
                        .requestMatchers(HttpMethod.PUT, "/api/orders/**").hasAnyAuthority("ADMIN", "MUAHANG")
                        .requestMatchers(HttpMethod.DELETE, "/api/orders/**").hasAuthority("ADMIN") // Chỉ Admin mới được xóa PO

                        // 5. QUẢN LÝ HÀNG HÓA TRONG KHO (Products)
                        // Lưu ý: Mình để sẵn cả 2 URL đề phòng Controller của bạn dùng 1 trong 2
                        .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/hang-hoa/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/products/**", "/api/hang-hoa/**").hasAnyAuthority("ADMIN", "KHO")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**", "/api/hang-hoa/**").hasAnyAuthority("ADMIN", "KHO")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**", "/api/hang-hoa/**").hasAuthority("ADMIN")

                        // 6. QUẢN LÝ NHẬP KHO (Receipts)
                        .requestMatchers(HttpMethod.GET, "/api/phieu-nhap/**").hasAnyAuthority("ADMIN", "KHO", "MUAHANG")
                        .requestMatchers(HttpMethod.POST, "/api/phieu-nhap/**").hasAnyAuthority("ADMIN", "KHO") // Chỉ Kho và Admin mới được nhập hàng vào kho

                        // 7. QUẢN LÝ XUẤT KHO (Issues)
                        .requestMatchers(HttpMethod.GET, "/api/phieu-xuat/**").hasAnyAuthority("ADMIN", "KHO")
                        .requestMatchers(HttpMethod.POST, "/api/phieu-xuat/**").hasAnyAuthority("ADMIN", "KHO")

                        // 8. BÁO CÁO / THỐNG KÊ (Dashboard)
                        .requestMatchers(HttpMethod.GET, "/api/dashboard/**").hasAuthority("ADMIN") // Thường chỉ sếp mới được xem tổng quan

                        // --- CHỐT CHẶN CUỐI CÙNG ---
                        // Tất cả các API khác (nếu lỡ quên chưa khai báo ở trên) đều bắt buộc phải có Token
                        .requestMatchers(HttpMethod.OPTIONS,"/**").permitAll()

                        .anyRequest().authenticated()

                )
                // GẮN CÁI KHIÊN JWT VÀO ĐÂY!
                .addFilterBefore(jwtAuthenticationFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

}
