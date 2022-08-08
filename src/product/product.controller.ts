import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProductService } from './product.service';
import {
  CreateProductResponse,
  FindOneResponse,
  PRODUCT_SERVICE_NAME,
  DecreaseStockResponse,
} from './product.pb';
import {
  CreateProductRequestDto,
  FindOneRequestDto,
  DecreaseStockRequestDto,
} from './product.dto';

@Controller('product')
export class ProductController {
  @Inject(ProductService)
  private readonly productService: ProductService;

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'CreateProduct')
  private createProduct(
    payload: CreateProductRequestDto,
  ): Promise<CreateProductResponse> {
    return this.productService.createProduct(payload);
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'FindOne')
  private findOne(payload: FindOneRequestDto): Promise<FindOneResponse> {
    return this.productService.findOne(payload);
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'DecreaseStock')
  private decreaseStock(
    payload: DecreaseStockRequestDto,
  ): Promise<DecreaseStockResponse> {
    return this.productService.decreaseStock(payload);
  }
}
