package com.example.demo.controllers.category;

import java.util.List;
import java.util.Set;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Brand;
import com.example.demo.model.projection.Category.CategoryInfo;
import com.example.demo.model.request.category.AttributeFilterRequest;
import com.example.demo.model.response.brand.BrandDto;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.service.shopping.AttributeFilterService;

import org.springframework.web.bind.annotation.RequestBody;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class CategoryController {
    private final CategoryRepository categoryRepository;
    private final AttributeFilterService attributeFilterService;

    @Autowired
    public CategoryController(CategoryRepository categoryRepository, AttributeFilterService attributeFilterService){
        this.categoryRepository = categoryRepository;
        this.attributeFilterService = attributeFilterService;
    }

    @GetMapping("/categories/names")
    public List<String> getCategoryNames(){
        return categoryRepository.findAllCategoryIds();
    }

    @GetMapping("/categories")
    public List<CategoryInfo> getCategoryFull(){
        return categoryRepository.findAllCategoriesWithUnitType();
    }

    @GetMapping("/categories/{categoryName}/brands")
    public Set<BrandDto> getBrandsForCategory(@PathVariable String categoryName) {
        return categoryRepository.findByNameIgnoreCase(categoryName)
        .orElseThrow(() -> new RuntimeException("Product not found"))
        .getBrands()
        .stream()
        .map(brand -> new BrandDto(brand.getId(), brand.getName()))
        .collect(Collectors.toSet());
    }
    @PostMapping("/categories/filter-options")
    public List<String> attributesFilter(@RequestBody AttributeFilterRequest request){
        System.out.println("Category id " + request.getCategoryId());
        System.out.println("Brand selection " + request.getBrandSelections());
        return attributeFilterService.getMeasurements(request.getCategoryId(), request.getBrandSelections());
    }
}
