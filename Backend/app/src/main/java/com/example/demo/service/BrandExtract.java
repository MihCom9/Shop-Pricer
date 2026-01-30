package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.example.demo.data.Brand;
import com.example.demo.data.Product;
import com.example.demo.data.ProductType;
import com.example.demo.data.repository.BrandRepository;
import com.example.demo.data.repository.ProductRepository;
import com.example.demo.data.repository.ProductTypeRepository;

import jakarta.transaction.Transactional;

@Service
public class BrandExtract {
    private final ProductRepository productRepository;
    private final ProductTypeRepository productTypeRepository;
    private final BrandRepository brandRepository;

    @Autowired
    public BrandExtract(ProductRepository productRepository,
                        ProductTypeRepository productTypeRepository,
                        BrandRepository brandRepository) {
        this.productRepository = productRepository;
        this.productTypeRepository = productTypeRepository;
        this.brandRepository = brandRepository;
    }
    public void extractAllBrands(int maxPrint){
        Pageable pageable = PageRequest.of(0, 50); // page 0, 50 products per page
        Page<Product> page = productRepository.findAll(pageable);
        List<Product> products = page.getContent();
        List<ProductType> productTypes = productTypeRepository.findAllWithBrands();
        int missingProductFound=0;
        while (missingProductFound<maxPrint) {
            for(Product product : products){
                boolean hasBrand=false;
                boolean hasProductType=false;
                for (ProductType pt : productTypes) {
                    if (product.getProductName().toLowerCase().contains(pt.getDisplayName().toLowerCase())) {
                            hasProductType=true;
                            hasBrand = pt.getBrands().stream()
                                                .anyMatch(b -> product.getProductName()
                                                                    .toLowerCase()
                                                                    .contains(b.getName().toLowerCase()));
                    
                            if(hasBrand){
                                break;
                            }
                        }   
                }
                if(hasProductType && !hasBrand){
                    missingProductFound++;
                    System.out.printf("Product %s has been found for missing product brand in db\n",product.getProductName());
                }
                if(!hasProductType){
                    missingProductFound++;
                    System.out.printf("Product %s has been found for missing product type in db\n",product.getProductName());
                }
                if(missingProductFound>=maxPrint){
                    System.out.println("Found needed number of products");
                    return;
                }
            }
            if (page.hasNext()) {
                page = productRepository.findAll(page.nextPageable());
                products = page.getContent();
            } else {
                break; // no more pages
            }
            if (products.isEmpty()) {
                break;
            }

        }
    }
    @Transactional
    public Brand addBrand(String productTypeCode, String brandName) {
        ProductType pt = productTypeRepository
            .findByCodeIgnoreCase(productTypeCode)
            .orElseThrow(() -> new IllegalArgumentException(
                "ProductType with code '" + productTypeCode + "' not found"));

        Brand brand = new Brand(brandName);
        brand.setProductType(pt);

        return brandRepository.save(brand); // Save brand with proper relation
    }
}
