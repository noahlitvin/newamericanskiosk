Handlebars.registerHelper('I18n',
  function(str){
    return $.i18n(str);
  }
);
$.i18n({locale: 'en'}).load( {
    en: '../i18n/en.json',
    es: '../i18n/es.json',
    zh: '../i18n/zh.json'
} );

app = {};

app.steps = [
    "ScreensaverView",
    "ChooseLanguageView",
    "WelcomeView",
    "OriginView",
    "ConcernsView",
    "BankView",
    "CreditView"
];
app.currentStep = 0;

$(window).load(function() {
    app.Router = new app.NewAmericansKioskRouter();
    app.User = new app.NewAmericansKioskUser();

    app.Router.on('route:init', function(){
        var main_view = new app.NewAmericansKioskView({step: 0, model: app.User});
    });

    app.Router.on('route:gotostep', function( step ){ 
        var main_view = new app.NewAmericansKioskView({step: step, model: app.User});
    });

    Backbone.history.start();
});

app.NewAmericansKioskRouter = Backbone.Router.extend({
    routes: {
        "step/:id": "gotostep",
        "*path": "init"
    }
});

app.NewAmericansKioskUser = Backbone.Model.extend({
  initialize: function(){
    this.on("change:locale", function(model){
      $.i18n({
        locale: model.get('locale')
      });
    });
  }
});

app.NewAmericansKioskView = Backbone.View.extend({
  initialize: function(options){
    this.model = options.model
    app.currentStep = 0;
    if(options.step){
        app.currentStep = options.step;
    }
    this.$el = $(".container");
    this.renderCurrentStep();

    var avatarView = new app.AvatarView({parent: this, model: this.model});
  },

  nextStep: function() {
    app.currentStep++;
    this.renderCurrentStep();
  },

  renderCurrentStep: function() {
    var currentView = new app[app.steps[app.currentStep]]({parent: this});
    currentView.render();
    app.Router.navigate('step/' + app.currentStep);
  },

  print: function(options) {
    if(!options.asset){
      alert('Not available yet. Sorry!');
      return;
    }
    var target = "../print/" + app.User.get('locale') + "/" + options.asset
    var w = window.open(target);
    w.print();
  }

});

app.AvatarView = Backbone.View.extend({
  id: "stage",

  initialize: function(options) {
    this.parent = options.parent;
    this.model = options.model;
    this.render();

    _.bindAll(this, 'update');
    this.model.bind('change', this.update);
  },

  render: function(){
    var source = $('#AvatarTemplate').html();
    var template = Handlebars.compile(source);
    var html = template();
    this.$el.html(html);
    this.$el.find('.character .base').load( "images/character/base.svg");
    this.parent.$el.append(this.el);
  },

  update: function() {
    var view = this;

    _.each(this.model.changedAttributes(),function(value,key){
      switch(key) {
          case 'hairstyle':
            view.update_hairstyle(value);
            break;
          case 'haircolor':
            view.update_haircolor(value);
            break;
          case 'skin':
            view.update_skin(value);
            break;
          case 'gender':
            view.update_gender(value);
            break;
      }
    });
  },

  update_hairstyle: function(newValue) {
    this.$el.find('.character .hair').load( "images/character/hair-"+newValue+".svg");
    $("#stage .character .hair").attr('data-style', newValue );
  },

  update_haircolor: function(newValue) {
    $("#stage .character .hair").attr('data-color', newValue );
  },

  update_skin: function(newValue) {
    $("#stage .character .base").attr('data-color', newValue );
  },

  update_gender: function(newValue) {
    $("#stage .character .base").attr('data-gender', newValue );
  }

});

app.ScreensaverView = Backbone.View.extend({
  tagName: "section",
  id: "Screensaver",
  className: "full-width",

  initialize: function(options) {
    this.parent = options.parent;
  },

  render: function(){
    var source = $('#ScreensaverTemplate').html();
    var template = Handlebars.compile(source);
    var html = template();
    this.$el.html(html);
    this.parent.$el.append(this.el);
  },

  events: {
    "click": "start"
  },

  start: function() {
    this.$el.remove();
    this.parent.nextStep();
  }

});

app.ChooseLanguageView = Backbone.View.extend({
  tagName: "section",
  id: "ChooseLanguage",
  className: "full-width",

  initialize: function(options) {
    this.parent = options.parent;
  },

  render: function(){
    var source = $('#ChooseLanguageTemplate').html();
    var template = Handlebars.compile(source);
    var html = template();
    this.$el.html(html);
    this.parent.$el.append(this.el);
  },

  events: {
    "click a": "select_langauge"
  },

  select_langauge: function(e) {
    e.preventDefault();
    app.User.set({locale: $(e.target).attr('data-locale') });
    this.$el.remove();
    this.parent.nextStep();
  }
});

app.WelcomeView = Backbone.View.extend({
  tagName: "section",
  id: "Welcome",

  initialize: function(options) {
    this.parent = options.parent;
  },

  render: function(){
    var source = $('#WelcomeTemplate').html();
    var template = Handlebars.compile(source);
    var html = template();
    this.$el.html(html);
    this.parent.$el.append(this.el);
  },

  events: {
    "click .close-modal": "close_modal",
    "click .gender": "select_gender",
    "click .hairstyle": "select_hairstyle",
    "click .haircolor": "select_haircolor",
    "click .skin": "select_skin",
    "click #next": "next"
  },

  close_modal: function(e) {
    e.preventDefault();
    $(e.target).parents('.modal-wrap').fadeOut();
  },

  select_gender: function (e){
    e.preventDefault();
    $(".button.gender").removeClass('selected');
    $(e.target).addClass('selected');
    app.User.set({gender: $(e.target).attr('data-gender') });
  },

  select_hairstyle: function (e){
    e.preventDefault();
    $(".button.hairstyle").removeClass('selected');
    $(e.target).addClass('selected');
    app.User.set({hairstyle: $(e.target).attr('data-hairstyle') });
  },

  select_haircolor: function (e){
    e.preventDefault();
    $(".button.haircolor").removeClass('selected');
    $(e.target).addClass('selected');
    app.User.set({haircolor: $(e.target).attr('data-haircolor') });
  },

  select_skin: function (e){
    e.preventDefault();
    $(".button.skin").removeClass('selected');
    $(e.target).addClass('selected');
    app.User.set({skin: $(e.target).attr('data-skin') });
  },

  next: function(e) {
    e.preventDefault();
    this.$el.remove();
    this.parent.nextStep();
  }

});

app.OriginView = Backbone.View.extend({
  tagName: "section",
  id: "Origin",

  initialize: function(options) {
    this.parent = options.parent;
  },

  render: function(){
    var source = $('#OriginTemplate').html();
    var template = Handlebars.compile(source);
    var html = template();
    this.$el.html(html);
    this.parent.$el.append(this.el);

    var view = this;

    _.defer(function(){
      view.$el.find('#select-country').selectize({
        onChange: function(value) {
          view.parent.model.set('country',value);
          if(view.parent.model.get('borough')){
            view.next();
          }
        }
      });
      view.$el.find('#select-borough').selectize({
        onChange: function(value) {
          view.parent.model.set('borough',value);
          if(view.parent.model.get('country')){
            view.next();
          }
        }
      });
    });
  },

  next: function(e) {
    this.$el.remove();
    this.parent.nextStep();
  }

});

app.ConcernsView = Backbone.View.extend({
  tagName: "section",
  id: "Concerns",

  initialize: function(options) {
    this.parent = options.parent;
  },

  render: function(){
    var source = $('#ConcernsTemplate').html();
    var template = Handlebars.compile(source);
    var html = template();
    this.$el.html(html);
    this.parent.$el.append(this.el);
  },

  events: {
    "click a.concern-option": "optionSelect",
    "click a.print": "print",
    "click a.next": "next"
  },

  optionSelect: function(e){
    e.preventDefault();
    app.User.set({concerned: $(e.target).attr('data-concerned') === 'true' });
    this.$el.find('.modal-wrap .' + $(e.target).attr('data-concerned')).removeClass('hide');
    this.$el.find('.modal-wrap').removeClass('hide');
  },

  print: function(e){
    e.preventDefault();
    this.parent.print({asset: $(e.target).attr('data-print')});
  },

  next: function(e) {
    e.preventDefault();
    this.$el.remove();
    this.parent.nextStep();
  }

});

app.BankView = Backbone.View.extend({
  tagName: "section",
  id: "Bank",

  initialize: function(options) {
    this.parent = options.parent;
  },

  render: function(){
    var source = $('#BankTemplate').html();
    var template = Handlebars.compile(source);
    var html = template();
    this.$el.html(html);
    this.parent.$el.append(this.el);
  },

  events: {
    "click a.print": "print",
    "click a.next": "next",
    "click a.bank-1-option": "option1Select",
    "click a.bank-2-option": "option2Select"
  },

  option1Select: function(e){
    e.preventDefault();
    app.User.set({has_bank_account: $(e.target).attr('data-has_bank_account') === 'true' });
    this.$el.find(".bank-1-option.selected").removeClass('selected');
    $(e.target).addClass('selected');

    if(app.User.get('has_bank_account') == true){
      this.$el.find(".question-2-wrap").fadeIn();
      this.$el.find(".nyc-offerings-wrap").addClass('hide');
    }else{
      this.$el.find(".question-2-wrap").fadeOut();
      this.$el.find(".nyc-offerings-wrap").removeClass('hide');
      this.$el.find('.modal-wrap').removeClass('hide');
    }
  },

  option2Select: function(e){
    e.preventDefault();
    app.User.set({has_high_fees: $(e.target).attr('data-has_high_fees') === 'true' });
    this.$el.find(".bank-2-option.selected").removeClass('selected');
    $(e.target).addClass('selected');
    this.$el.find('.modal-wrap').removeClass('hide');
  },

  print: function(e){
    e.preventDefault();
    this.parent.print({asset: $(e.target).attr('data-print')});
  },

  next: function(e) {
    this.$el.remove();
    this.parent.nextStep();
  }

});

app.CreditView = Backbone.View.extend({
  tagName: "section",
  id: "Credit",

  initialize: function(options) {
    this.parent = options.parent;
  },

  render: function(){
    var source = $('#CreditTemplate').html();
    var template = Handlebars.compile(source);
    var html = template();
    this.$el.html(html);
    this.parent.$el.append(this.el);
  },

  events: {
    "click a.credit-option": "optionSelect",
    "click a.print": "print",
    "click a.next": "next"
  },

  optionSelect: function(e){
    e.preventDefault();
    app.User.set({has_credit_knowledge: $(e.target).attr('data-has_credit_knowledge') === 'true' });
    if( app.User.get('has_credit_knowledge') ){
      this.next();
    }else{
      this.$el.find('.modal-wrap').removeClass('hide');
    }
  },

  print: function(e){
    e.preventDefault();
    this.parent.print({asset: $(e.target).attr('data-print')});
  },

  next: function(e) {
    e.preventDefault();
    this.$el.remove();
    this.parent.nextStep();
  }

});
