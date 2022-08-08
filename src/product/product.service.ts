import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { Product } from './entity/product.entity';
import { StockDecreaseLog } from './entity/stock-decrease-log.entity';
import {
  FindOneRequestDto,
  CreateProductRequestDto,
  DecreaseStockRequestDto,
} from './product.dto';
import {
  FindOneResponse,
  FindOneData,
  CreateProductResponse,
  DecreaseStockResponse,
} from './product.pb';

@Injectable()
export class ProductService {
  @InjectRepository(Product)
  private readonly productRepository: Repository<Product>;

  @InjectRepository(StockDecreaseLog)
  private readonly stockDecreaseLogRepository: Repository<StockDecreaseLog>;

  public async findOne({ id }: FindOneRequestDto): Promise<FindOneResponse> {
    const product: Product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      return {
        data: null,
        error: ['Product not found'],
        status: HttpStatus.NOT_FOUND,
      };
    }

    return {
      data: product,
      error: null,
      status: HttpStatus.OK,
    };
  }

  public async createProduct(
    payload: CreateProductRequestDto,
  ): Promise<CreateProductResponse> {
    const product: Product = new Product();

    Object.assign(product, payload);

    await this.productRepository.save(product);

    return { id: product.id, error: null, status: HttpStatus.OK };
  }

  public async decreaseStock({
    id,
    orderId,
  }: DecreaseStockRequestDto): Promise<DecreaseStockResponse> {
    const product: Product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      return { error: ['Product not found'], status: HttpStatus.NOT_FOUND };
    } else if (product.stock <= 0) {
      return {
        error: ['Product out of stock'],
        status: HttpStatus.CONFLICT,
      };
    }

    const isAlreadyDecreased: number =
      await this.stockDecreaseLogRepository.count({ where: { orderId } });

    if (isAlreadyDecreased) {
      return {
        error: ['Order already decreased stock'],
        status: HttpStatus.CONFLICT,
      };
    }

    await this.productRepository.update(product.id, {
      stock: product.stock - 1,
    });

    await this.stockDecreaseLogRepository.insert({ product, orderId });

    return { error: null, status: HttpStatus.OK };
  }
}
