import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'lms-angular';

  public locale = 'en-US';
  public options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  };

  public dateTimeFormatter = new Intl.DateTimeFormat(this.locale, this.options);

  public currentTime: string = this.dateTimeFormatter.format(new Date());

  ngOnInit() {
    setInterval(() => {
      this.currentTime = this.dateTimeFormatter.format(new Date());
    }, 1000);
  }
}
