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
import { ViewDekverklaringPageComponent as MemberViewDekverklaringPageComponent } from './member-page/dekverklaringen-page/view-dekverklaring-page/view-dekverklaring-page.component';
import { HuiskeuringenPageComponent as MemberHuiskeuringenPageComponent } from './member-page/huiskeuringen-page/huiskeuringen-page.component';
import { AddHuiskeuringPageComponent as MemberAddHuiskeuringPageComponent } from './member-page/huiskeuringen-page/add-huiskeuring-page/add-huiskeuring-page.component';
import { ViewHuiskeuringPageComponent as MemberViewHuiskeuringPageComponent } from './member-page/huiskeuringen-page/view-huiskeuring-page/view-huiskeuring-page.component';
import { FalcooPageComponent as MemberFalcooPageComponent } from './member-page/falcoo-page/falcoo-page.component';
import { ProtocollenCLPageComponent as MemberProtocollenCLPageComponent } from './member-page/protocollen-clpage/protocollen-clpage.component';
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
import { PrijslijstPageComponent } from './lid-worden-page/prijslijst-page/prijslijst-page.component';
import { InschrijvenPageComponent } from './lid-worden-page/inschrijven-page/inschrijven-page.component';
import { SignupsPageComponent as MemberSignupsPageComponent } from './member-page/signups-page/signups-page.component';
import { ViewSignupPageComponent as MemberViewSignupPageComponent } from './member-page/signups-page/view-signup-page/view-signup-page.component';
import { VerzondenPageComponent as InschrijvenVerzondenPageComponent } from './lid-worden-page/inschrijven-page/verzonden-page/verzonden-page.component';
import { NewPasswordPageComponent } from './login-page/new-password-page/new-password-page.component';
import { MarktplaatsPageComponent } from './member-page/marktplaats-page/marktplaats-page.component';
import { AddAdvertPageComponent as MemberAddAdvertPageComponent } from './member-page/marktplaats-page/add-advert-page/add-advert-page.component';
import { ManageAdvertsPageComponent as MemberManageAdvertsPageComponent } from './member-page/marktplaats-page/manage-adverts-page/manage-adverts-page.component';
import { ViewAdvertPageComponent as MemberViewAdvertsPageComponent } from './member-page/marktplaats-page/view-advert-page/view-advert-page.component';
import { EditAdvertPageComponent as MemberEditAdvertPageComponent } from './member-page/marktplaats-page/edit-advert-page/edit-advert-page.component';

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
  { path: "lid-worden/prijslijst", component: PrijslijstPageComponent },
  { path: "lid-worden/inschrijven", component: InschrijvenPageComponent },
  { path: "lid-worden/inschrijven/verzonden", component: InschrijvenVerzondenPageComponent },
  { path: "login", component: LoginPageComponent },
  { path: "login/nieuw-wachtwoord", component: NewPasswordPageComponent },
  { path: "wachtwoord-vergeten/verzonden", component: WachtwoordVergetenVerzondenPageComponent },
  { path: "wachtwoord-vergeten/opnieuw-instellen", component: WachtwoordVergetenOpnieuwInstellenPageComponent },
  { path: "wachtwoord-vergeten", component: WachtwoordVergetenPageComponent },
  { path: "ledenportaal", component: MemberPageComponent, canActivate: [AuthGuard], 
    children: [
      { path: "", component: MemberHomePageComponent },
      { path: "formulier-dekverklaring", component: MemberDekverklaringenPageComponent },
      { path: "formulier-dekverklaring/toevoegen", component: MemberAddDekverklaringPageComponent },
      { path: "formulier-dekverklaring/:id", component: MemberViewDekverklaringPageComponent },
      { path: "formulier-huiskeuring", component: MemberHuiskeuringenPageComponent },
      { path: "formulier-huiskeuring/toevoegen", component: MemberAddHuiskeuringPageComponent },
      { path: "formulier-huiskeuring/:id", component: MemberViewHuiskeuringPageComponent },
      { path: "inschrijvingen", component: MemberSignupsPageComponent },
      { path: "inschrijvingen/:id", component: MemberViewSignupPageComponent },
      { path: "gebruikers", component: MemberUsersPageComponent },
      { path: "gebruikers/toevoegen", component: MemberAddUserPageComponent },
      { path: "gebruikers/:id", component: MemberEditUserPageComponent },
      { path: "falcoo", component: MemberFalcooPageComponent },
      { path: "protocollen-cl", component: MemberProtocollenCLPageComponent },
      { path: "marktplaats", component: MarktplaatsPageComponent },
      { path: "marktplaats/toevoegen", component: MemberAddAdvertPageComponent },
      { path: "marktplaats/beheren", component: MemberManageAdvertsPageComponent },
      { path: "marktplaats/:id/bewerken", component: MemberEditAdvertPageComponent },
      { path: "marktplaats/:id", component: MemberViewAdvertsPageComponent },
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
