package com.example.demo.service;

import java.math.BigInteger;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import com.example.demo.data.Brand;
import com.example.demo.data.Product;
import com.example.demo.data.ProductType;
import com.example.demo.data.ProductTypeAlias;
import com.example.demo.data.repository.BrandRepository;
import com.example.demo.data.repository.ProductRepository;
import com.example.demo.data.repository.ProductTypeAliasRepository;
import com.example.demo.data.repository.ProductTypeRepository;

import jakarta.transaction.Transactional;

@Service
public class BrandExtractor {
    private final ProductRepository productRepository;
    private final ProductTypeRepository productTypeRepository;
    private final BrandRepository brandRepository;
    private final ProductTypeAliasRepository productTypeAliasRepository;

    @Autowired
    public BrandExtractor(ProductRepository productRepository,
                        ProductTypeRepository productTypeRepository,
                        BrandRepository brandRepository,
                        ProductTypeAliasRepository productTypeAliasRepository) {
        this.productRepository = productRepository;
        this.productTypeRepository = productTypeRepository;
        this.brandRepository = brandRepository;
        this.productTypeAliasRepository=productTypeAliasRepository;
    }
    public void extractAllBrands(int maxPrint){
        Pageable pageable = PageRequest.of(0, 10000);
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
                    boolean codeMatch = product.getCategory().equals(pt.getCode().toString());

                    if (codeMatch) {
                        matchedType = pt;
                        break;
                    }   
                }
                if(matchedType == null){
                    missingProductFound++;
                    // System.out.printf("Product %s with product code %s has been found for missing product type in db\n",product.getProductName(),product.getCategory());
                    continue;
                }
                String normalizedProductName =productName.toLowerCase();
                boolean hasBrand = matchedType.getBrands().stream()
                    .anyMatch(b -> normalizedProductName.contains(b.getName().toLowerCase()));
                
                if (!hasBrand && !(15<=matchedType.getCode()&&matchedType.getCode()<=25)) {
                    missingProductFound++;
                    // System.out.printf("Product %s with product code %s has been found for missing product type in db\n",product.getProductName(),product.getCategory());
                }else{
                    skippedProduct = skippedProduct.add(BigInteger.ONE);
                    // System.out.printf("Product %s is in db\n",product.getProductName());
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
                break;
            }
            if (products.isEmpty()) {
                break;
            }

        }
        System.out.println("Found needed number of products");
        System.out.printf("Skipped %s products in the procces\n",skippedProduct);
    }
    @Transactional
    public Brand addBrand(String productTypeName, String brandName) {

        ProductType pt = productTypeRepository
            .findByProductNameIgnoreCase(productTypeName)
            .orElseThrow(() ->
                new IllegalArgumentException(
                    "ProductType with name '" + productTypeName + "' not found"
                )
            );

        // If brand already exists
        return pt.getBrands().stream()
            .filter(b -> b.getName().equalsIgnoreCase(brandName))
            .findFirst()
            .orElseGet(() -> {
                Brand brand = new Brand(brandName);
                brand.setProductType(pt);
                return brandRepository.save(brand);
            });
    }
    @Transactional
    public ProductTypeAlias addAlias(String productTypeName, String aliasName) {

        ProductType pt = productTypeRepository
            .findByProductNameIgnoreCase(productTypeName)
            .orElseThrow(() ->
                new IllegalArgumentException(
                    "ProductType with name '" + productTypeName + "' not found"
                )
            );

        return pt.getAliases().stream()
        .filter(a -> a.getName().equalsIgnoreCase(aliasName))
        .findFirst()
        .orElseGet(() -> {
            ProductTypeAlias alias = new ProductTypeAlias(aliasName, pt);
            return productTypeAliasRepository.save(alias);
        });
    }
    @Transactional
    public void deleteProductType(String productName) {
        productTypeRepository.deleteByProductNameIgnoreCase(productName);
    }
    @Transactional
    public ProductType addProductType(Integer code, String productName){
        if(productTypeRepository.existsByCode(code)){
            new IllegalArgumentException(
                    "ProductType with code '" + code + "' not found"
            );
        }
        ProductType pt = new ProductType(code, productName);
            return productTypeRepository.save(pt);
    }
}
