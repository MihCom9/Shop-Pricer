package com.example.demo.service;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import com.example.demo.data.Brand;
import com.example.demo.data.Product;
import com.example.demo.data.ProductType;
import com.example.demo.data.ProductTypeAlias;
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
        Slice<Product> slice = productRepository.findAllBy(pageable);
        List<Product> products = slice.getContent();
        List<ProductType> productTypes = productTypeRepository.findAllWithAliasesAndBrands();
        int missingProductFound=0;
        BigInteger skippedProduct=new BigInteger("0");
        while (missingProductFound<maxPrint) {
            for(Product product : products){
                String productName = product.getProductName().toLowerCase();
                ProductType matchedType = null;
                for (ProductType pt : productTypes) {
                    boolean aliasMatch = pt.getAliases().stream()
                        .anyMatch(a -> productName.contains(a.getName().toLowerCase()));

                    if (aliasMatch) {
                        matchedType = pt;
                        System.out.printf("Alias has been matched\n");
                        break;
                    }   
                }
                if(matchedType == null){
                    missingProductFound++;
                    System.out.printf("Product %s has been found for missing product type in db\n",product.getProductName());
                    continue;
                }
                boolean hasBrand = matchedType.getBrands().stream()
                    .anyMatch(b -> productName.contains(b.getName().toLowerCase()));
                
                if (!hasBrand) {
                    missingProductFound++;
                    System.out.printf("Product %s has been found for missing product type in db\n",product.getProductName());
                }else{
                    skippedProduct = skippedProduct.add(BigInteger.ONE);
                    continue;
                }
                if(missingProductFound>=maxPrint){
                    System.out.println("Found needed number of products");
                    System.out.printf("Skipped %s products in the procces\n",skippedProduct);
                    return;
                }
            }
            if (slice.hasNext()) {
                slice = productRepository.findAllBy(slice.nextPageable());
                products = slice.getContent();
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
    @Transactional
    public ProductTypeAlias addAlias(String productTypeCode, String aliasName) {

        ProductType pt = productTypeRepository
            .findByCodeIgnoreCase(productTypeCode)
            .orElseThrow(() ->
                new IllegalArgumentException(
                    "ProductType with code '" + productTypeCode + "' not found"
                )
            );

        // Optional: prevent duplicates
        boolean exists = pt.getAliases().stream()
            .anyMatch(a -> a.getName().equalsIgnoreCase(aliasName));

        if (exists) {
            throw new IllegalArgumentException("Alias already exists for this product type");
        }

        ProductTypeAlias alias = new ProductTypeAlias(aliasName, pt);
        pt.addAlias(alias); // keeps both sides in sync

        productTypeRepository.save(pt); // cascade saves alias

        return alias;
    }
}
