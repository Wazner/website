import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorIntlImpl } from './localization/MatPaginator';

import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTableModule } from "@angular/material/table";
import { VerticalMenuModule } from './vertical-menu/vertical-menu.module';
import { AuthenticationService } from './services/authentication.service';
import { ToolbarModule } from "./toolbar/toolbar.module";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar'; 
import { MatDialogModule } from "@angular/material/dialog";
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormModule } from './form/form.module';
import { MatRadioModule } from "@angular/material/radio";
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { GalleryModule } from 'ng-gallery';
import { LightboxModule } from  'ng-gallery/lightbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from "@angular/material/toolbar"
import { MatSidenavModule } from "@angular/material/sidenav"
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { AppComponent } from './app.component';
import { HomePageComponent } from './home-page/home-page.component';
import { DisclaimerPageComponent } from './disclaimer-page/disclaimer-page.component';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { MemberPageComponent } from './member-page/member-page.component';
import { HomePageComponent as MemberHomePageComponent } from "./member-page/home-page/home-page.component";
import { UsersPageComponent } from './member-page/users-page/users-page.component';
import { DeleteConfirmationDialogComponent } from './delete-confirmation-dialog/delete-confirmation-dialog.component';
import { AddUserPageComponent } from './member-page/users-page/add-user-page/add-user-page.component';
import { EditUserPageComponent } from './member-page/users-page/edit-user-page/edit-user-page.component';
import { UserFormComponent } from './member-page/users-page/user-form/user-form.component';

import { TableDataSourceFactory } from './services/table-data-source.service';
import { MessageComponent } from './message/message.component';
import { DekverklaringenPageComponent } from './member-page/dekverklaringen-page/dekverklaringen-page.component';
import { AddDekverklaringPageComponent } from './member-page/dekverklaringen-page/add-dekverklaring-page/add-dekverklaring-page.component';
import { ViewDekverklaringPageComponent } from './member-page/dekverklaringen-page/view-dekverklaring-page/view-dekverklaring-page.component';
import { HuiskeuringenPageComponent } from './member-page/huiskeuringen-page/huiskeuringen-page.component';
import { AddHuiskeuringPageComponent } from './member-page/huiskeuringen-page/add-huiskeuring-page/add-huiskeuring-page.component';
import { ViewHuiskeuringPageComponent } from './member-page/huiskeuringen-page/view-huiskeuring-page/view-huiskeuring-page.component';
import { BaseUrlInterceptor } from './base-url.interceptor';
import { ContactPageComponent } from './contact-page/contact-page.component';
import { VerenigingPageComponent } from './vereniging-page/vereniging-page.component';
import { OverDeVerenigingPageComponent } from './vereniging-page/over-de-vereniging-page/over-de-vereniging-page.component';
import { BestuurEnCommissiesPageComponent } from './vereniging-page/bestuur-en-commissies-page/bestuur-en-commissies-page.component';
import { CalamiteitenplanPageComponent } from './vereniging-page/calamiteitenplan-page/calamiteitenplan-page.component';
import { MonitoringService } from './services/monitoring.service';
import { ErrorHandlerService } from './services/error-handler.service';
import { LidWordenPageComponent } from './lid-worden-page/lid-worden-page.component';
import { IntlDateTimePipe } from './intl-date-time.pipe';
import { IntlDateTimeService } from './services/intl-date-time.service';
import { AppTitleService } from './services/app-title.service';
import { WachtwoordVergetenPageComponent } from './wachtwoord-vergeten-page/wachtwoord-vergeten-page.component';
import { VerzondenPageComponent as WachtwoordVergetenVerzondenPageComponent } from './wachtwoord-vergeten-page/verzonden-page/verzonden-page.component';
import { OpnieuwInstellenPageComponent } from './wachtwoord-vergeten-page/opnieuw-instellen-page/opnieuw-instellen-page.component';
import { PrijslijstPageComponent } from './lid-worden-page/prijslijst-page/prijslijst-page.component';
import { IntlNumberPipe } from './intl-number.pipe';
import { IntlNumberService } from './services/intl-number.service';
import { InschrijvenPageComponent } from './lid-worden-page/inschrijven-page/inschrijven-page.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS } from '@angular/material/core';
import { IntlDateAdapterService } from './services/intl-date-adapter.service';
import { SignupsPageComponent } from './member-page/signups-page/signups-page.component';
import { ViewSignupPageComponent } from './member-page/signups-page/view-signup-page/view-signup-page.component';
import { VerzondenPageComponent as InschrijvenVerzondenPageComponent } from './lid-worden-page/inschrijven-page/verzonden-page/verzonden-page.component';
import { NewPasswordPageComponent } from './login-page/new-password-page/new-password-page.component';
import { FalcooPageComponent } from './member-page/falcoo-page/falcoo-page.component';
import { ProtocollenCLPageComponent } from './member-page/protocollen-clpage/protocollen-clpage.component';
import { InstructieRvoMachtigingComponent } from './lid-worden-page/inschrijven-page/instructie-rvo-machtiging/instructie-rvo-machtiging.component';
import { MobileMenuComponent } from './mobile-menu/mobile-menu.component';
import { MarktplaatsPageComponent } from './member-page/marktplaats-page/marktplaats-page.component';
import { AddAdvertPageComponent } from './member-page/marktplaats-page/add-advert-page/add-advert-page.component';
import { ManageAdvertsPageComponent } from './member-page/marktplaats-page/manage-adverts-page/manage-adverts-page.component';
import { ViewAdvertPageComponent } from './member-page/marktplaats-page/view-advert-page/view-advert-page.component';
import { EditAdvertPageComponent } from './member-page/marktplaats-page/edit-advert-page/edit-advert-page.component';
import { FilePreviewDirective } from './file-preview.directive';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    DisclaimerPageComponent,
    NotFoundPageComponent,
    LoginPageComponent,
    MemberPageComponent,
    MemberHomePageComponent,
    UsersPageComponent,
    DeleteConfirmationDialogComponent,
    AddUserPageComponent,
    EditUserPageComponent,
    UserFormComponent,
    MessageComponent,
    DekverklaringenPageComponent,
    AddDekverklaringPageComponent,
    ViewDekverklaringPageComponent,
    HuiskeuringenPageComponent,
    AddHuiskeuringPageComponent,
    ViewHuiskeuringPageComponent,
    ContactPageComponent,
    VerenigingPageComponent,
    OverDeVerenigingPageComponent,
    BestuurEnCommissiesPageComponent,
    CalamiteitenplanPageComponent,
    LidWordenPageComponent,
    IntlDateTimePipe,
    WachtwoordVergetenPageComponent,
    WachtwoordVergetenVerzondenPageComponent,
    OpnieuwInstellenPageComponent,
    PrijslijstPageComponent,
    IntlNumberPipe,
    InschrijvenPageComponent,
    InschrijvenVerzondenPageComponent,
    SignupsPageComponent,
    ViewSignupPageComponent,
    NewPasswordPageComponent,
    FalcooPageComponent,
    ProtocollenCLPageComponent,
    InstructieRvoMachtigingComponent,
    MobileMenuComponent,
    MarktplaatsPageComponent,
    AddAdvertPageComponent,
    ManageAdvertsPageComponent,
    ViewAdvertPageComponent,
    EditAdvertPageComponent,
    FilePreviewDirective
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,

    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule,
    MatRadioModule,
    MatCardModule,
    MatDividerModule,
    MatSelectModule,
    GalleryModule,
    LightboxModule,
    MatTooltipModule,
    MatToolbarModule,
    MatSidenavModule,
    MatDatepickerModule,
    MatMenuModule,
    MatButtonToggleModule,

    VerticalMenuModule,
    ToolbarModule,
    FormModule
  ],
  providers: [
    AuthenticationService,
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlImpl },
    TableDataSourceFactory,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BaseUrlInterceptor,
      multi: true,
    },
    { provide: "BASE_API_URL", useValue: environment.apiUrl },
    MonitoringService,
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    IntlDateTimeService,
    IntlNumberService,
    Title,
    AppTitleService,
    { provide: DateAdapter, useClass: IntlDateAdapterService },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
