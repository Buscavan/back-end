import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { Roles } from 'src/auth/roles/roles.decorator';
import { Role } from '@prisma/client';
import { ViagemService } from './viagem.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ViagemDto } from './dtos/viagem.dto';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { ViagemFilterDto } from './dtos/viagem-filter.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller('viagem')
export class ViagemController {
  constructor(private viagemService: ViagemService) {}

  @Roles(Role.DRIVER)
  @Post('/create')
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new ValidationPipe({ transform: true }))
  async createViagem(
    @Body('dtoString') dtoString: string, // Change dto to dtoString
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ) {
    try {
      const dto = plainToInstance(ViagemDto, JSON.parse(dtoString));
      dto.origemId = dto.origemId && parseInt(dto.origemId.toString());
      dto.destinoId = dto.destinoId && parseInt(dto.destinoId.toString());

      return this.viagemService.createViagem(dto, file, request);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      throw new BadRequestException('Invalid JSON');
    }
  }

  @Roles(Role.DRIVER, Role.PASSANGER)
  @Get('/unico/:id')
  findViagemById(@Param('id') id: number) {
    return this.viagemService.findViagemById(id);
  }

  @Roles(Role.DRIVER, Role.PASSANGER)
  @Get('/motorista/:id')
  findAllByMotoristaId(@Param('id') id: string) {
    return this.viagemService.findAllByMotoristaId(id);
  }

  @Roles(Role.DRIVER)
  @Delete('/delete/:id')
  deleteViagem(@Param('id') id: number) {
    return this.viagemService.deleteViagem(id);
  }

  @Roles(Role.DRIVER)
  @Put(':id')
  updateViagem(@Param('id') id: number, @Body() dto: ViagemDto) {
    return this.viagemService.updateViagem(id, dto);
  }

  @Roles(Role.PASSANGER)
  @Post(':id/comment')
  addComment(@Param('id') id: number, @Body() comment: CreateCommentDto) {
    return this.viagemService.addComment(id, comment);
  }

  @Roles(Role.DRIVER, Role.PASSANGER)
  @Get('/veiculo/:placa')
  getVeiculoByPlaca(@Param('placa') placa: string) {
    return this.viagemService.getVeiculoByPlaca(placa);
  }

  @Roles(Role.DRIVER, Role.PASSANGER)
  @Get('/todas')
  getAllCidade() {
    return this.viagemService.getViagens();
  }

  @Roles(Role.DRIVER, Role.PASSANGER)
  @Get('/filter')
  async getViagens(@Query() filterDto: ViagemFilterDto) {
    return this.viagemService.getViagensByFilter(filterDto);
  }
}
