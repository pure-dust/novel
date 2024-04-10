import {createApp} from "vue";
import '../../assets/style.less';
import App from "./App.vue";
import preload from "./preload";

const app = createApp(App)

preload().then(() => {
  app.mount("#app");
})