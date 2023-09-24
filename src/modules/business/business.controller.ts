import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  /**
   * Register a new business
   * @param createBusinessDto
   * @param res
   * @returns
   */
  @Post('register')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'featuredImage', maxCount: 1 },
      { name: 'backgroundImage', maxCount: 1 },
      { name: 'logoImage', maxCount: 1 },
    ]),
  )
  async create(
    @Body() createBusinessDto: CreateBusinessDto,
    @UploadedFiles() files: any,
  ) {
    createBusinessDto.featuredImage = files?.featuredImage[0] || null;
    createBusinessDto.backgroundImage = files?.backgroundImage[0] || null;
    createBusinessDto.logoImage = files?.logoImage[0] || null;

    try {
      const createdBusiness = await this.businessService.register(
        createBusinessDto,
      );

      return {
        success: true,
        message: 'Business successfully registered',
        business: createdBusiness,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to register business',
        error: error.message,
      };
    }
  }

  // @Post('register')
  // async create(
  //   @Body() body: CreateBusinessDto,
  //   @Res() res: Response,
  // ): Promise<any> {
  //   try {
  //     console.log('body: ', body);
  //     // console.log('uploaded files: ', files);
  //     // assign the body fields to createBusinessDto
  //     const createBusinessDto: CreateBusinessDto = new CreateBusinessDto();
  //     Object.assign(createBusinessDto, body);

  //     // const business = await this.businessService.register(createBusinessDto);

  //     return res.status(HttpStatus.CREATED).json({
  //       success: true,
  //       message: 'business successfully added',
  //       // business: business,
  //     });
  //   } catch (err) {
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: 'failed to register user',
  //       error: err.message,
  //     });
  //   }
  // }

  // /**
  //  * Retrieve all businesses
  //  * @param res
  //  * @returns
  //  */
  // @Get('all')
  // async findAll(@Res() res: Response): Promise<any> {
  //   try {
  //     const business = await this.businessService.findAll();
  //     const length: number = Object.keys(business).length;

  //     return res.status(HttpStatus.CREATED).json({
  //       success: true,
  //       message: `Fetched ${length} businesses`,
  //       business,
  //     });
  //   } catch (error) {
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: 'failed to get list of businesses',
  //       error: error.message,
  //     });
  //   }
  // }

  // /**
  //  * Get business information by id
  //  * @param id
  //  * @param res
  //  * @returns
  //  */
  // @Get(':id')
  // async findOne(@Param('id') id: string, @Res() res: Response): Promise<any> {
  //   try {
  //     const business = await this.businessService.findOne(id);

  //     return res.status(HttpStatus.OK).json({
  //       success: true,
  //       message: 'business information fetched',
  //       business,
  //     });
  //   } catch (err) {
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: 'failed to retrieve business information',
  //       error: err.message,
  //     });
  //   }
  // }

  // /**
  //  * Update business information
  //  * @param id
  //  * @param updateUserDto
  //  * @param res
  //  * @returns
  //  */
  // @Patch('update/:id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateUserDto: UpdateBusinessDto,
  //   @Res() res: Response,
  // ): Promise<any> {
  //   try {
  //     await this.businessService.update(id, updateUserDto);
  //     return res.status(HttpStatus.OK).json({
  //       success: true,
  //       message: 'business information updated',
  //       business: updateUserDto.name,
  //     });
  //   } catch (err) {
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: 'failed to update business information',
  //       error: err.message,
  //     });
  //   }
  // }

  // /**
  //  * Delete a business by ID
  //  * @param id
  //  * @returns
  //  */
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.businessService.remove(id);
  // }

  // /**
  //  * Get all businesses by category
  //  */
  // @Get('category/:category')
  // async findByCategory(
  //   @Param('category') category: string,
  //   @Res() res: Response,
  // ): Promise<any> {
  //   try {
  //     const business = await this.businessService.findByCategory(category);
  //     const length: number = Object.keys(business).length;
  //     return res.status(HttpStatus.CREATED).json({
  //       success: true,
  //       message: `Fetched ${length} businesses`,
  //       business,
  //     });
  //   } catch (error) {
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: 'failed to get list of businesses',
  //       error: error.message,
  //     });
  //   }
  // }

  // /**
  //  * Get all businesses by country
  //  */
  // @Get('country/:country')
  // async findByCountry(
  //   @Param('country') country: string,
  //   @Res() res: Response,
  // ): Promise<any> {
  //   try {
  //     const business = await this.businessService.findByCountry(country);
  //     const length: number = Object.keys(business).length;
  //     return res.status(HttpStatus.CREATED).json({
  //       success: true,
  //       message: `Fetched ${length} businesses`,
  //       business,
  //     });
  //   } catch (error) {
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: 'failed to get list of businesses',
  //       error: error.message,
  //     });
  //   }
  // }

  // /**
  //  * Get all businesses by continent
  //  */
  // @Get('continent/:continent')
  // async findByContinent(
  //   @Param('continent') continent: string,
  //   @Res() res: Response,
  // ): Promise<any> {
  //   try {
  //     const business = await this.businessService.findByContinent(continent);
  //     const length: number = Object.keys(business).length;
  //     return res.status(HttpStatus.CREATED).json({
  //       success: true,
  //       message: `Fetched ${length} businesses`,
  //       business,
  //     });
  //   } catch (error) {
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: 'failed to get list of businesses',
  //       error: error.message,
  //     });
  //   }
  // }

  // /**
  //  * Gell all businesses by location
  //  */
  // @Post('nearby')
  // async findByLocation(
  //   @Body() body: { lat: number; lng: number; radius: number },
  //   @Res() res: Response,
  // ): Promise<any> {
  //   try {
  //     const business = await this.businessService.findStoresNearby(
  //       body.lat,
  //       body.lng,
  //       body.radius,
  //     );
  //     const length: number = Object.keys(business).length;
  //     return res.status(HttpStatus.CREATED).json({
  //       success: true,
  //       message: `Fetched ${length} businesses`,
  //       business,
  //     });
  //   } catch (error) {
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: 'failed to get list of businesses',
  //       error: error.message,
  //     });
  //   }
  // }
}
