	import React ,{Component} from 'react';	
      import LineChart from 'react-linechart';
 


	export default class LineGraph extends Component {


         constructor(props){
              super(props);
              
            }


    render() {
        const data = [
            {									
                color: "steelblue", 
                points: this.props.plotdata,
            }
        ];
        return null;
    }
}