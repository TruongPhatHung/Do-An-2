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

                        .requestMatchers("/api/auth/**").permitAll()

                        // 2. QUẢN LÝ TÀI KHOẢN (Chỉ Admin)
                        .requestMatchers("/api/users/**").hasAuthority("ADMIN")

                        // 3. QUẢN LÝ NHÀ CUNG CẤP (Suppliers)
                        .requestMatchers(HttpMethod.GET, "/api/suppliers/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/suppliers/**").hasAnyAuthority("ADMIN", "MUAHANG")
                        .requestMatchers(HttpMethod.PUT, "/api/suppliers/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/suppliers/**").hasAuthority("ADMIN")

                        // 4. QUẢN LÝ LÊN ĐƠN HÀNG (Orders / PO)
                        .requestMatchers(HttpMethod.GET, "/api/orders/**").hasAnyAuthority("ADMIN", "MUAHANG", "KHO")
                        .requestMatchers(HttpMethod.POST, "/api/orders/**").hasAnyAuthority("ADMIN", "MUAHANG")
                        .requestMatchers(HttpMethod.PUT, "/api/orders/**").hasAnyAuthority("ADMIN", "MUAHANG")
                        .requestMatchers(HttpMethod.DELETE, "/api/orders/**").hasAuthority("ADMIN")

                        // 5. QUẢN LÝ HÀNG HÓA TRONG KHO (Products)
                        .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/hang-hoa/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/products/**", "/api/hang-hoa/**").hasAnyAuthority("ADMIN", "KHO", "QUANLYKHO")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**", "/api/hang-hoa/**").hasAnyAuthority("ADMIN", "KHO", "QUANLYKHO")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**", "/api/hang-hoa/**").hasAuthority("ADMIN")

                        // 6. QUẢN LÝ NHẬP KHO (Receipts)
                        .requestMatchers(HttpMethod.GET, "/api/phieu-nhap/**").hasAnyAuthority("ADMIN", "KHO", "MUAHANG", "QUANLYKHO")
                        .requestMatchers(HttpMethod.POST, "/api/phieu-nhap/**").hasAnyAuthority("ADMIN", "KHO", "QUANLYKHO")

                        // 7. QUẢN LÝ XUẤT KHO (Issues)
                        .requestMatchers(HttpMethod.GET, "/api/phieu-xuat/**").hasAnyAuthority("ADMIN", "KHO", "QUANLYKHO")
                        .requestMatchers(HttpMethod.POST, "/api/phieu-xuat/**").hasAnyAuthority("ADMIN", "KHO", "QUANLYKHO")

                        // 8. BÁO CÁO / THỐNG KÊ (Dashboard)
                        .requestMatchers(HttpMethod.GET, "/api/dashboard/**").hasAuthority("ADMIN")

                        // 9. QUẢN LÝ YÊU CẦU XUẤT KHO (Lệnh xuất)
                        .requestMatchers(HttpMethod.GET, "/api/yeu-cau-xuat/**").hasAnyAuthority("ADMIN", "KHO", "QUANLYKHO")
                        .requestMatchers(HttpMethod.POST, "/api/yeu-cau-xuat/**").hasAnyAuthority("ADMIN", "QUANLYKHO")

                        .requestMatchers(HttpMethod.PUT, "/api/yeu-cau-xuat/*/duyet").hasAuthority("ADMIN")
                        // =========================================================
                        // 🎯 10. MỚI: QUẢN LÝ YÊU CẦU MUA HÀNG (Quy trình PR -> PO)
                        // =========================================================
                        .requestMatchers(HttpMethod.GET, "/api/yeu-cau-mua", "/api/yeu-cau-mua/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/yeu-cau-mua", "/api/yeu-cau-mua/**").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/yeu-cau-mua", "/api/yeu-cau-mua/**").permitAll()
                        .requestMatchers("/api/trao-doi", "/api/trao-doi/**").permitAll()
                        // --- CHỐT CHẶN CUỐI CÙNG ---
                        .requestMatchers(HttpMethod.OPTIONS,"/**").permitAll()
                        .requestMatchers("/api/thong-bao", "/api/thong-bao/**").permitAll()
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

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}