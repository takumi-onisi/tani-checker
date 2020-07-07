window.onload = init;

/**
 * 
 * 科目区分の単位を管理するクラス
 */
class TaniSection {
  //htmlオブジェクトを引数として受け取る
  constructor(section) {
    this.section = section;
    //idを名前として利用
    this.name = section.id;
    //そのセクションで必要な単位数を保持
    this.necessary = section.dataset.necessary;
    //チェックした単位数と必要単位数を比較した残り
    this.remainingTani = section.dataset.necessary;
    //このtaniSectionの直下にあるtaniSectionを配列として保持
    this.childTaniSections = [];
    //チェックボックスでチェックされた単位数を保持
    this.tani = 0;

  }

  getTani() {
    return this.tani;
  }

  addTani(value) {
    this.tani += value;
  }


  appendChildTaniSection(AnInstanceOfTaniSection) {
    this.childTaniSections.push(AnInstanceOfTaniSection);
  }

  //前回判定した結果をクリアする
  resetPreviousResult() {
    this.tani = 0;
    this.remainingTani = this.necessary;
    this.section.style.backgroundColor = "#fff";
    this.removeMessage()
  }

  //自身の下にあるtaniSectionの持つ単位を合計し自身の単位数として格納する
  sumTaniOfthisChildTaniSections() {
    this.tani = 0;
    for (let i = 0; i < this.childTaniSections.length; i++) {
      this.tani += this.childTaniSections[i].getTani();
    }
  }

  //自身のセクション内にある授業科目のでチェックされた単位数を足す
  setThisSectionsKamokuTani() {

    //セクション内の科目を順に調べてチェックボックスにチェックがあればそのバリューをthis.taniに足していく
    let kamoku = this.section.getElementsByClassName("kamoku");
    this.tani = 0;
    for (let i = 0; i < kamoku.length; i++) {
      if (kamoku[i].checked) {
        this.tani += Number(kamoku[i].value);
      }
    }
  }

  //他学科などの追加の単位を追加する
  addAdditionalTani() {
    let target = this.section.getElementsByClassName("additionalTani");
    Array.from(target).forEach(element => {
      if (element.dataset.belong == this.name) {
        this.tani += Number(element.value);
      }
    })
  }


  //残り何単位足りないのかを計算し残りの必要な単位数を格納する
  calcRemainingTani() {
    this.remainingTani = this.necessary - this.tani;
  }

  //必要な単位が取れているかどうかを表示する
  writeResult() {
    //必要な単位が残っていた場合
    if (this.remainingTani > 0) {
      //セクション内の背景を変更する
      this.section.style.backgroundColor = "rgb(255, 244, 138)";
      //科目へのリンクをつくる
      let linkToKamoku = document.createElement("a");
      linkToKamoku.appendChild(
        document.createTextNode(this.name)
      );
      linkToKamoku.href = `#${this.name}`;
      //判定結果のメッセージをつくる
      let message = "の単位が残り" + this.remainingTani + "足りません";
      //判定結果を格納するパラグラフを作る
      let messageParagraph = document.createElement("p");
      messageParagraph.classList.add("sectionMessage", "caution");
      messageParagraph.appendChild(linkToKamoku);
      messageParagraph.appendChild(
        document.createTextNode(message)
      );
      // このセクションないに結果を表示する
      this.section.appendChild(messageParagraph);
      //このセクションの外resultAreaに結果を表示する
      ResultManager.writeResult(messageParagraph.cloneNode("deep"));
    }
  }

  //表示した判定結果を消す
  removeMessage() {
    Array.from(this.section.getElementsByClassName("sectionMessage"))
      .forEach(element => {
        if (element.parentNode == this.section) {
          element.remove();
        }
      });
  }


}//class TaniSection 閉じ

//必修科目専用のクラス
class CompulsoryTaniSection extends TaniSection {
  constructor(section) {
    super(section);
  }
  setThisSectionsKamokuTani() {
    //必修科目のチェックされた単位をセットする
    this.tani = 0;
    let must = document.getElementsByClassName("must");
    for (let i = 0; i < must.length; i++) {
      if (must[i].checked) {
        this.tani += Number(must[i].value);
      }
    }
  }

}//class CompalsoryTaniSection閉じ

//必修外国語専用のクラス
class CompulsoryLanguageTaniSection extends TaniSection {
  constructor(section) {
    super(section);
    this.mostTani = 0;
  }
  sumTaniOfthisChildTaniSections() {
    //childTaniSectionsの中で最も多くの単位を取った言語の単位数をtheMostに入れる
    let theMost = 0;
    this.tani = 0;
    Array.from(this.childTaniSections).forEach(childTaniSection => {
      let currentTani = childTaniSection.getTani()
      this.tani += currentTani;
      if (currentTani >= theMost) {
        theMost = currentTani;
      }
    })
    this.mostTani += theMost;
  }
  //他学科などの追加の単位を追加する
  addAdditionalTani() {
    let target = this.section.getElementsByClassName("additionalTani");
    Array.from(target).forEach(element => {
      if (element.dataset.belong == this.name) {
        this.tani += Number(element.value);
        this.mostTani += Number(element.value);
      }
    })
  }
  //残り何単位足りないのかを計算し残りの必要な単位数を格納する
  calcRemainingTani() {
    this.remainingTani = this.necessary - this.mostTani;
  }



  //必要な単位が取れているかどうかを表示する
  writeResult() {
    //必要な単位が残っていた場合
    if (this.remainingTani > 0) {
      this.section.style.backgroundColor = "rgb(255, 244, 138)";
      let linkToKamoku = document.createElement("a");
      linkToKamoku.appendChild(
        document.createTextNode(this.name)
      );
      linkToKamoku.href = `#${this.name}`;
      let message = "の単位が残り" + this.remainingTani +
        "足りません。必修外国語は単一言語で少なくとも"
        + this.necessary + "単位取得する必要があります";
      let messageParagraph = document.createElement("p");
      messageParagraph.classList.add("sectionMessage", "caution");
      messageParagraph.appendChild(linkToKamoku);
      messageParagraph.appendChild(
        document.createTextNode(message)
      );

      // このセクション内に結果を表示する
      this.section.appendChild(messageParagraph)
      //こののセクションの外に結果を表示する
      ResultManager.writeResult(messageParagraph.cloneNode("deep"))
    }
  }


}//class CompalsoryLanguageTaniSection閉じ

//taniSectionとは別に判定結果を操作するためのクラス
class ResultManager {
  //サイドコラムの結果を表示するエリアid=resultに結果を表示する
  static writeResult(messageParagraph) {
    let resultArea = document.getElementById("result")
    let newListItem = document.createElement("li");
    newListItem.classList.add("resultMessage");
    newListItem.classList.add("flashCaution");
    newListItem.appendChild(messageParagraph);
    resultArea.appendChild(newListItem);
  }//resultwrite閉じ

  //表示した単位の判定結果を消す
  static clearResultLists() {
    let resultArea = document.getElementById("result");
    let resultMessage = document.getElementsByClassName("resultMessage");
    while (resultMessage.length > 0) {
      resultArea.removeChild(resultMessage[0]);
    }
  }

  //セクション内に表示したメッセージを消す
  static clearSectionsMessage() {
    let targets = document.getElementsByClassName("sectionMessage");
    Array.from(targets).forEach(element => {
      element.remove()
    })
  }

  //まとめてクリアできるようにメソッドをまとめたもの
  static clearPreviousResults() {
    ResultManager.clearResultLists();
    ResultManager.clearSectionsMessage();
    Array.from(document.getElementsByClassName("kubun"))
      .forEach(element => {
        element.style.backgroundColor = "#fff";
      })
  }

}//ResultManager閉じ




//学生が留学生かどうかによって必修外国語の科目を変更するためのクラス
class SwitcherForHissyugaikokugo {
  //学生が留学生かどうかチェックボックスの結果を保存する
  constructor() {
    this.setStudentType();
  }

  setStudentType() {
    this.studentIsNotForeigner
      = document.getElementById("NotForeignStudent").checked
  }

  switchHtmlView() {
    let englishAndChineseElements = Array.from(
      document.getElementsByClassName("englishAndChinese"));
    let japaneseElements = Array.from(
      document.getElementsByClassName("japanese"));
    if (this.studentIsNotForeigner) {
      //学生は留学生ではないので英語と中国語を履修する
      //英語と中国語の科目を表示する
      englishAndChineseElements.forEach(element => {
        element.classList.remove("displayNone");
      })
      //日本語の科目の単位を表示させないようにする
      japaneseElements.forEach(element => {
        element.classList.add("displayNone");
      })
    } else {
      //学生は留学生なので日本語を履修する
      englishAndChineseElements.forEach(element => {
        element.classList.add("displayNone");
      })
      japaneseElements.forEach(element => {
        element.classList.remove("displayNone");
      })

    }
  }//switchHtmlView

  switchTargetOfTaniCHeck() {
    let englishAndChinese = document.getElementById("英語と中国語");
    let japanese = document.getElementById("日本語");
    if (document.getElementById("NotForeignStudent").checked) {
      //学生は留学生ではないので英語と中国語を履修する
      //英語と中国語を単位の集計に加える
      englishAndChinese.classList.add("kubun");
      //日本語を単位の集計から外す
      japanese.classList.remove("kubun");
    } else {
      //学生は留学生なので日本語を履修する
      // 英語と中国語を単位の集計から外す
      englishAndChinese.classList.remove("kubun");
      //日本語を単位の集計に加える
      japanese.classList.add("kubun");

    }
  } //switchTargetOfTaniCHeck閉じ

  // class SwitcherForHissyugaikokugoのインスタンスを用いて必修外国語を切り替える関数
  switchThehissyuuGaikokugo() {
    this.setStudentType();
    this.switchHtmlView();
    this.switchTargetOfTaniCHeck();

  }
}// class SwitcherForHissyugaikokugo 閉じ




// 単位を計算する機能をまとめたクラス
class TaniChecker {


  //set The Sum Of KamokuTani To TheBottom Of ChildTaniSections
  checkTaniFromTheBottomSection(taniSection) {
    //taniSectionが子要素を持っている場合
    if (taniSection.childTaniSections.length > 0) {
      taniSection.childTaniSections.forEach(childTaniSection => {
        //まず子要素を持っていないtaniSectionまで再帰関数によって降りていく
        this.checkTaniFromTheBottomSection(childTaniSection);
      })
      //再帰関数によってtaniSectionの底（子要素）がない所から戻ってきた後の処理
      taniSection.resetPreviousResult();
      //自身の子要素が持っている単位数を足す
      taniSection.sumTaniOfthisChildTaniSections();
      //他学科等の単位を足す
      taniSection.addAdditionalTani();
      //単位が必要な分取れているか計算する
      taniSection.calcRemainingTani();
      //結果を表示する
      taniSection.writeResult();
    } else {
      //taniSectionの底（子要素を持っていないインスタンス）での処理
      taniSection.resetPreviousResult();
      //セクション内のチェックが入った教科の単位を足していく
      taniSection.setThisSectionsKamokuTani();
      taniSection.addAdditionalTani();
      taniSection.calcRemainingTani();
      taniSection.writeResult();
    }

  }//function checkTaniFromTheBottomSection の閉じ



  //taniSectionが入れ子構造になったツリーを生成する関数
  generateInstanceOfTaniSectionTree(rootTaniSection, targetHtmlClassName) {
    /*parentTaniSectionはclass TaniSectionのインスタンス。
    これに子どものTaniSectionのインスタンスをぶら下げて入れ子構造にしていく
    */
    let parentTaniSection = rootTaniSection;
    Array.from(parentTaniSection.section.getElementsByClassName(targetHtmlClassName)).forEach(childHtmlElement => {
      //取得した要素が親要素に属していた場合その要素を子要素として追加していく
      if (parentTaniSection.name == childHtmlElement.dataset.belong) {
        let childTaniSection = undefined;
        switch (childHtmlElement.id) {
          //必修科目専用のクラスを使う
          case "必修科目":
            childTaniSection = new CompulsoryTaniSection(childHtmlElement);
            break;

          case "英語と中国語":
            childTaniSection = new CompulsoryLanguageTaniSection(childHtmlElement);
            break;

          default:
            childTaniSection = new TaniSection(childHtmlElement);
            break;
        }
        parentTaniSection.appendChildTaniSection(childTaniSection);
        //もし子要素にさらに子要素があれば再帰関数によって子要素がなくなるまで繰り返す。
        if (childHtmlElement.getElementsByClassName(targetHtmlClassName).length > 0) {
          this.generateInstanceOfTaniSectionTree(childTaniSection, targetHtmlClassName);
        }
      }
    })
    return parentTaniSection
  } //function generateInstanceOfTaniSectionTree閉じ


  // フォームの結果を取得して単位が要件を満たしているか判定し、結果を表示する
  checkTani() {

    // 既に表示されている判定結果をリセットする
    ResultManager.clearPreviousResults();

    //単位セクション(taniSection)のインスタンスを生成し入れ子構造（ツリー）を作る
    //checkTaniが実行されるたびに新しいインスタンスが生成される
    let rootTaniSection = new TaniSection(document.getElementById("科目表"));

    let TaniSectionTree = this.generateInstanceOfTaniSectionTree(rootTaniSection, "kubun");

    //単位セクションのツリーの単位をチェックし結果を表示していく
    this.checkTaniFromTheBottomSection(TaniSectionTree);

    //すべての結果をもとにメッセージを表示する
    let resultMessages = document.getElementById("result")
      .getElementsByClassName("resultMessage");
    //もしメッセージが何も表示されていなかった場合
    if (resultMessages.length === 0) {
      //このセクションの外resultAreaに結果を表示する
      let messageParagraph = document.createElement("p");
      messageParagraph.classList.add("sectionMessage", "desirable");
      messageParagraph.appendChild(document.createTextNode("単位が卒業要件を満たしています"));
      ResultManager.writeResult(messageParagraph);
    }

  }//function checkTani閉じ

}//class Tanichecker閉じ


// 見て目を調整するためのクラス
class ViewManager {

  //サイドコラムの位置を調整する
  adjustSideColumn() {

    let header = document.getElementById("header");
    let sideColumns = document.getElementsByClassName("sideColumn");

    // 画面が小さい場合はサイドコラムの位置の調整をかけない
    if (document.documentElement.clientWidth < 1000) {
      Array.from(sideColumns).forEach(element => {
        element.style.height = "auto";
      })
      return
    }

    //メインヘッダーが画面から消えたとき
    if (header.getBoundingClientRect().bottom < 1) {
      //サイドコラムを画面の一番上に配置する
      Array.from(sideColumns)
        .forEach(element => {
          element.style.top = "0px";
          // サイドコラムの高さを調整しフッターが隠れないようにする
          element.style.height = document.documentElement.clientHeight
            - document.getElementById("footer").clientHeight + "px";
        })
    } else {
      //メインヘッダーが見えている間はサイドコラムがメインヘッダにぶら下がるようにする
      Array.from(sideColumns)
        .forEach(element => {
          element.style.top = header.getBoundingClientRect().bottom + "px";
          // サイドコラムの高さを調整
          element.style.height = document.documentElement.clientHeight
            - header.getBoundingClientRect().bottom + "px";

        })
    }
  }// adjustSideColumn閉じ

  //単位チェックを行うボタンを調整する関数
  adjustExcecuteButtonArea() {
    let executeButtonArea = document.getElementById("executeButtonArea");
    let mainTable = document.getElementById("科目表");
    //科目表が画面に表示されている間
    if (mainTable.getBoundingClientRect().top < 32 &&
      mainTable.getBoundingClientRect().bottom > window.innerHeight) {
      executeButtonArea.style.position = "fixed"
      executeButtonArea.style.bottom = document.getElementById("footer").clientHeight + 10 + "px"
    } else {
      executeButtonArea.style.position = "static";
    }
  }// adjustExcecuteButtonArea閉じ

  addjustMainNavigation() {
    let mainNavigation = document.getElementById("mainNavigation");
    //画面が大きい時はメインナビゲーションは必要ないので表示させない
    if (document.documentElement.clientWidth >= 1000) {
      mainNavigation.style.visibility = "hidden";
      return
    } else { //画面が小さい時
      mainNavigation.style.visibility = "visible";
    }
    let mainTable = document.getElementById("科目表");
    //科目表が画面に表示されている間
    if (mainTable.getBoundingClientRect().top < 32 &&
      mainTable.getBoundingClientRect().bottom > window.innerHeight) {
      mainNavigation.style.position = "fixed";
      mainNavigation.style.top = 32 + "px";
      mainNavigation.style.right = 0 + "px";
      mainNavigation.style.boxShadow = "-6px 6px 3px #666666"
    } else {
      mainNavigation.style.position = "static";
      mainNavigation.style.boxShadow = "none"
    }
  }//method addjustMainNavigation閉じ

}//class ViewManager閉じ


//ポップアップさせる要素に関するクラス
class ContainerForPopUp {
  constructor(containerForPopUp, contentOfPopUp, mainNavigation) {
    //ポップアップさせる要素のコンテナ
    this.containerForPopUp = containerForPopUp;
    //ポップアップさせる要素のコンテンツが入っている
    this.contentOfPopUp = contentOfPopUp;
    //メインナビゲーションのリンクがポップアップする。メインナビゲーションはポップアップと逆の動きをする
    this.mainNavigation = mainNavigation;
    //押すとポップアップコンテナがポップアップする
    this.trigger;
    //押すとポップアップが消える
    this.closeButton;
    //クローズボタンを生成
    this.createCloseButton();
  }

  // ポップアップされた要素を閉じるためのボタンを生成
  createCloseButton() {
    const buttonArea = document.createElement("div");
    buttonArea.style.visibility = "hidden";
    buttonArea.classList.add("buttonArea");
    const closeButton = document.createElement("span");
    this.closeButton = closeButton;
    closeButton.classList.add("closeButton");
    closeButton.classList.add("button");
    const textNode = document.createTextNode("閉じる");
    buttonArea.appendChild(closeButton);
    closeButton.appendChild(textNode);
    // ポップアップコンテナに付け加える
    this.containerForPopUp.appendChild(buttonArea);

    this.addFunctionToClosePopUpElementsTo(this.closeButton);
  }

  //引数に取った要素がクリックされるとポップアップが閉じるようにする
  addFunctionToClosePopUpElementsTo(element) {
    element.addEventListener("click", () => {
      this.containerForPopUp.classList.remove("containerForPopUp");
      this.contentOfPopUp.classList.remove("contentOfPopUp");
      this.closeButton.style.visibility = "hidden";
      this.mainNavigation.style.visibility = "visible";
    }, false);
  }

  //引数に取った要素がクリックされるとポップアップするようにする
  addTriggerToPopUp(trigger) {
    trigger.addEventListener("click", () => {
      //画面が大きい時はポップアップさせない
      if (document.documentElement.clientWidth >= 1000) {
        this.containerForPopUp.classList.remove("containerForPopUp");
        this.contentOfPopUp.classList.remove("contentOfPopUp");
        this.closeButton.style.visibility = "hidden";
        return
      }
      this.containerForPopUp.classList.add("containerForPopUp");
      this.contentOfPopUp.classList.add("contentOfPopUp");
      this.closeButton.style.visibility = "visible";
      this.mainNavigation.style.visibility = "hidden";
    })
  }




}// class popUpContainer閉じ



function init() {

  //popUpさせるアイテムを設定する
  const containerForPopUpThatContainsKamokuArea
    = new ContainerForPopUp(
      document.getElementById("kamokuArea"),
      document.getElementById("indexOfKamoku"),
      document.getElementById("mainNavigation")
    );

  //popUpさせるアイテムを設定する
  const containerForPopUpThatContainsResultArea
    = new ContainerForPopUp(
      document.getElementById("resultArea"),
      document.getElementById("contentsContainerInResultArea"),
      document.getElementById("mainNavigation")
    );

  //見た目を調整するためのオブジェクトを生成
  const viewManager = new ViewManager();
  //必要な単位が取れているか計算するオブジェクト
  const taniChecker = new TaniChecker();
  //学生が留学生かどうかによって必修外国語の表示を非表示のものとそうでないものに分ける
  const switcherForHissyugaikokugo = new SwitcherForHissyugaikokugo();
  switcherForHissyugaikokugo.switchThehissyuuGaikokugo();
  //学生のタイプ（留学生かどうか）が切り替わるたびにスイッチされるようにする
  const inputAreaForCheckingForeigner = document.getElementById("inputAreaForCheckingForeigner");
  inputAreaForCheckingForeigner
    .addEventListener("click", function () {
      switcherForHissyugaikokugo.switchThehissyuuGaikokugo();
    })


  //ボタンをクリックすると単位を判定するように設定する
  document.getElementById("buttonGetResults")
    .addEventListener("click", function () {
      //単位をチェックする
      taniChecker.checkTani()
      //判定結果の要素resultLiが動的に作成されるため改めてpopUpの機能を設定する
      //判定結果一覧のリンクがクリックされた時にポップアップされている要素が消えるようにする
      let anchorsOfResult = document.getElementById("result").getElementsByTagName("a");
      Array.from(anchorsOfResult).forEach(element => {
        containerForPopUpThatContainsResultArea.addFunctionToClosePopUpElementsTo(element);
      })
    }, false);



  //ボタンを押すと結果をリセット
  document.getElementById("buttonResetResults")
    .addEventListener("click",
      ResultManager.clearPreviousResults, false);



  //画面の見た目の調整
  viewManager.adjustSideColumn();
  viewManager.adjustExcecuteButtonArea();

  window.addEventListener("resize",
    function () {
      viewManager.addjustMainNavigation();
      viewManager.adjustSideColumn();
      viewManager.adjustExcecuteButtonArea();
    }, false);
  window.addEventListener("scroll",
    function () {
      viewManager.addjustMainNavigation();
      viewManager.adjustSideColumn();
      viewManager.adjustExcecuteButtonArea();
    }, false);





  // メインナビゲーションのリンクがポップアップで表示されるようにする
  //科目一覧がメインナビゲーションのリンクでポップアップするようにする
  containerForPopUpThatContainsKamokuArea.addTriggerToPopUp(document.getElementById("anchorLinkedIndexOfKamoku"))
  // 科目一覧のリンクが押されたらポップアップが消えるようにする
  let anchorsOfKamoku = document.getElementById("indexOfKamoku").getElementsByTagName("a");
  Array.from(anchorsOfKamoku).forEach(element => {
    containerForPopUpThatContainsKamokuArea.addFunctionToClosePopUpElementsTo(element);

  })


  //判定結果一覧がメインナビゲーションのリンクでポップアップするようにする
  containerForPopUpThatContainsResultArea.addTriggerToPopUp(document.getElementById("anchorLinkedResultArea"))
  //判定結果一覧が判定ボタンを押すとポップアップするようにする
  containerForPopUpThatContainsResultArea.addTriggerToPopUp(document.getElementById("buttonGetResults"))




}//function init閉じかっこ
