import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

import { DisclaimerPageComponent } from './disclaimer-page/disclaimer-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { MemberPageComponent } from './member-page/member-page.component';
import { HomePageComponent as MemberHomePageComponent } from "./member-page/home-page/home-page.component";
import { UsersPageComponent as MemberUsersPageComponent } from './member-page/users-page/users-page.component';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';
import { AddUserPageComponent as MemberAddUserPageComponent } from './member-page/users-page/add-user-page/add-user-page.component';
import { EditUserPageComponent as MemberEditUserPageComponent } from './member-page/users-page/edit-user-page/edit-user-page.component';
import { DekverklaringenPageComponent as MemberDekverklaringenPageComponent } from './member-page/dekverklaringen-page/dekverklaringen-page.component';
import { AddDekverklaringPageComponent as MemberAddDekverklaringPageComponent } from './member-page/dekverklaringen-page/add-dekverklaring-page/add-dekverklaring-page.component';
import { EditDekverklaringPageComponent as MemberEditDekverklaringPageComponent } from './member-page/dekverklaringen-page/edit-dekverklaring-page/edit-dekverklaring-page.component';
import { HuiskeuringenPageComponent as MemberHuiskeuringenPageComponent } from './member-page/huiskeuringen-page/huiskeuringen-page.component';
import { AddHuiskeuringPageComponent as MemberAddHuiskeuringPageComponent } from './member-page/huiskeuringen-page/add-huiskeuring-page/add-huiskeuring-page.component';
import { EditHuiskeuringPageComponent as MemberEditHuiskeuringPageComponent } from './member-page/huiskeuringen-page/edit-huiskeuring-page/edit-huiskeuring-page.component';
import { ContactPageComponent } from './contact-page/contact-page.component';
import { VerenigingPageComponent } from './vereniging-page/vereniging-page.component';
import { OverDeVerenigingPageComponent } from './vereniging-page/over-de-vereniging-page/over-de-vereniging-page.component';
import { BestuurEnCommissiesPageComponent } from './vereniging-page/bestuur-en-commissies-page/bestuur-en-commissies-page.component';
import { CalamiteitenplanPageComponent } from './vereniging-page/calamiteitenplan-page/calamiteitenplan-page.component';
import { LidWordenPageComponent } from './lid-worden-page/lid-worden-page.component';
import { ScrollRestorationService } from './services/scroll-restoration.service';
import { WachtwoordVergetenPageComponent } from './wachtwoord-vergeten-page/wachtwoord-vergeten-page.component';
import { VerzondenPageComponent as WachtwoordVergetenVerzondenPageComponent } from './wachtwoord-vergeten-page/verzonden-page/verzonden-page.component';
import { OpnieuwInstellenPageComponent as WachtwoordVergetenOpnieuwInstellenPageComponent } from './wachtwoord-vergeten-page/opnieuw-instellen-page/opnieuw-instellen-page.component';

const routes: Routes = [
  { path: "", component: HomePageComponent },
  { path: "vereniging", component: VerenigingPageComponent,
    children: [
      { path: "", redirectTo: "over-de-vereniging", pathMatch: "full" },
      { path: "over-de-vereniging", component: OverDeVerenigingPageComponent },
      { path: "bestuur-en-commissies", component: BestuurEnCommissiesPageComponent },
      { path: "calamiteitenplan", component: CalamiteitenplanPageComponent },
      { path: "**", component: NotFoundPageComponent }
    ]
  },
  { path: 'fokken', loadChildren: () => import('./fokken-page/fokken-page.module').then(m => m.FokkenPageModule) },
  { path: "disclaimer", component: DisclaimerPageComponent },
  { path: "contact", component: ContactPageComponent },
  { path: "lid-worden", component: LidWordenPageComponent },
  { path: "login", component: LoginPageComponent },
  { path: "wachtwoord-vergeten/verzonden", component: WachtwoordVergetenVerzondenPageComponent },
  { path: "wachtwoord-vergeten/opnieuw-instellen", component: WachtwoordVergetenOpnieuwInstellenPageComponent },
  { path: "wachtwoord-vergeten", component: WachtwoordVergetenPageComponent },
  { path: "ledenportaal", component: MemberPageComponent, canActivate: [AuthGuard], 
    children: [
      { path: "", component: MemberHomePageComponent },
      { path: "formulier-dekverklaring", component: MemberDekverklaringenPageComponent },
      { path: "formulier-dekverklaring/toevoegen", component: MemberAddDekverklaringPageComponent },
      { path: "formulier-dekverklaring/:id", component: MemberEditDekverklaringPageComponent },
      { path: "formulier-huiskeuring", component: MemberHuiskeuringenPageComponent },
      { path: "formulier-huiskeuring/toevoegen", component: MemberAddHuiskeuringPageComponent },
      { path: "formulier-huiskeuring/:id", component: MemberEditHuiskeuringPageComponent },
      { path: "gebruikers", component: MemberUsersPageComponent },
      { path: "gebruikers/toevoegen", component: MemberAddUserPageComponent },
      { path: "gebruikers/:id", component: MemberEditUserPageComponent },
      { path: "**", component: NotFoundPageComponent }
    ]
  },
  { path: "**", component: NotFoundPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: "disabled", anchorScrolling: "enabled" })],
  exports: [RouterModule],
  providers: [ScrollRestorationService]
})
export class AppRoutingModule {
  constructor(private scrollRestorationService: ScrollRestorationService) {}
}
