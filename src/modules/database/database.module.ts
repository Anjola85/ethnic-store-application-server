// import { Global, Module } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { MongooseModule } from '@nestjs/mongoose';

// @Module({
//   imports: [
//     MongooseModule.forRootAsync({
//       inject: [ConfigService],
//       useFactory: async (configService: ConfigService) => ({
//         uri: EnvConfigService.get<string>('DATABASE_URI'),
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//       }),
//     }),
//   ],
// })
// export class DatabseModule {}
