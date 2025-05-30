package com.example.SpringReactProject.repository;

import com.example.SpringReactProject.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepository extends JpaRepository<Book, Long> {}
